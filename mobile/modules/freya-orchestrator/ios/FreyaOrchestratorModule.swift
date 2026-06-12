import ExpoModulesCore
import EventKit
import UIKit

public class FreyaOrchestratorModule: Module {
  private let eventStore = EKEventStore()

  public func definition() -> ModuleDefinition {
    Name("FreyaOrchestrator")

    AsyncFunction("requestCalendarAccess") { () -> Bool in
      try await self.requestAccess(for: .event)
    }

    AsyncFunction("requestRemindersAccess") { () -> Bool in
      try await self.requestAccess(for: .reminder)
    }

    AsyncFunction("getEventsBetween") { (startIso: String, endIso: String) -> [[String: Any]] in
      let formatter = ISO8601DateFormatter()
      formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
      var start = formatter.date(from: startIso)
      var end = formatter.date(from: endIso)
      if start == nil {
        formatter.formatOptions = [.withInternetDateTime]
        start = formatter.date(from: startIso)
        end = formatter.date(from: endIso)
      }
      guard let startDate = start, let endDate = end else { return [] }

      let calendars = self.eventStore.calendars(for: .event)
      let predicate = self.eventStore.predicateForEvents(withStart: startDate, end: endDate, calendars: calendars)
      let events = self.eventStore.events(matching: predicate)

      return events.map { event in
        var record: [String: Any] = [
          "id": event.eventIdentifier ?? UUID().uuidString,
          "title": event.title ?? "Untitled",
          "startDate": event.startDate.iso8601String,
          "endDate": event.endDate.iso8601String,
        ]
        if let location = event.location { record["location"] = location }
        if let notes = event.notes { record["notes"] = notes }
        if let calendarTitle = event.calendar.title { record["calendarTitle"] = calendarTitle }
        return record
      }
    }

    AsyncFunction("createEvent") { (input: [String: Any]) -> String in
      let title = input["title"] as? String ?? "Event"
      guard let startIso = input["startIso"] as? String,
            let endIso = input["endIso"] as? String,
            let start = ISO8601DateFormatter().date(from: startIso) ?? ISO8601DateFormatter().fallbackDate(from: startIso),
            let end = ISO8601DateFormatter().date(from: endIso) ?? ISO8601DateFormatter().fallbackDate(from: endIso)
      else {
        throw Exception(name: "InvalidDates", description: "Invalid event dates")
      }

      let event = EKEvent(eventStore: self.eventStore)
      event.title = title
      event.startDate = start
      event.endDate = end
      event.calendar = self.eventStore.defaultCalendarForNewEvents
      if let location = input["location"] as? String { event.location = location }
      if let notes = input["notes"] as? String { event.notes = notes }

      try self.eventStore.save(event, span: .thisEvent)
      return event.eventIdentifier ?? ""
    }

    AsyncFunction("updateEvent") { (input: [String: Any]) -> Bool in
      guard let id = input["id"] as? String,
            let event = self.eventStore.calendarItem(withIdentifier: id) as? EKEvent
      else { return false }

      if let title = input["title"] as? String { event.title = title }
      if let startIso = input["startIso"] as? String,
         let start = ISO8601DateFormatter().date(from: startIso) ?? ISO8601DateFormatter().fallbackDate(from: startIso) {
        event.startDate = start
      }
      if let endIso = input["endIso"] as? String,
         let end = ISO8601DateFormatter().date(from: endIso) ?? ISO8601DateFormatter().fallbackDate(from: endIso) {
        event.endDate = end
      }
      if let location = input["location"] as? String { event.location = location }
      if let notes = input["notes"] as? String { event.notes = notes }

      try self.eventStore.save(event, span: .thisEvent)
      return true
    }

    AsyncFunction("createReminder") { (input: [String: Any]) -> String in
      let title = input["title"] as? String ?? "Reminder"
      let reminder = EKReminder(eventStore: self.eventStore)
      reminder.title = title
      reminder.calendar = self.eventStore.defaultCalendarForNewReminders()
      if let notes = input["notes"] as? String { reminder.notes = notes }
      if let dueIso = input["dueIso"] as? String,
         let due = ISO8601DateFormatter().date(from: dueIso) ?? ISO8601DateFormatter().fallbackDate(from: dueIso) {
        reminder.dueDateComponents = Calendar.current.dateComponents(
          [.year, .month, .day, .hour, .minute],
          from: due
        )
      }
      try self.eventStore.save(reminder, commit: true)
      return reminder.calendarItemIdentifier
    }

    AsyncFunction("openUrl") { (urlString: String) -> Bool in
      guard let url = URL(string: urlString) else { return false }
      return await self.open(url)
    }

    AsyncFunction("openMessages") { (input: [String: Any]) -> Bool in
      let body = input["body"] as? String ?? ""
      let recipients = input["recipients"] as? [String] ?? []
      var components = URLComponents(string: "sms:")!

      if recipients.isEmpty {
        components.path = ""
      } else {
        components.path = recipients.joined(separator: ",")
      }
      components.queryItems = [URLQueryItem(name: "body", value: body)]
      guard let url = components.url else { return false }
      return await self.open(url)
    }

    AsyncFunction("openPhone") { (number: String) -> Bool in
      let sanitized = number.filter { $0.isNumber || $0 == "+" }
      guard let url = URL(string: "tel://\(sanitized)") else { return false }
      return await self.open(url)
    }

    AsyncFunction("runShortcut") { (input: [String: Any]) -> Bool in
      guard let name = input["name"] as? String,
            var components = URLComponents(string: "shortcuts://run-shortcut") else { return false }
      components.queryItems = [URLQueryItem(name: "name", value: name)]
      if let shortcutInput = input["input"] as? String {
        components.queryItems?.append(URLQueryItem(name: "input", value: shortcutInput))
      }
      guard let url = components.url else { return false }
      return await self.open(url)
    }

    AsyncFunction("isAutomationAvailable") { () -> [String: Bool] in
      let calendar = EKEventStore.authorizationStatus(for: .event)
      let shortcutsUrl = URL(string: "shortcuts://")!
      let shortcuts = await UIApplication.shared.canOpenURL(shortcutsUrl)
      return [
        "calendar": calendar == .authorized || calendar == .fullAccess,
        "shortcuts": shortcuts,
      ]
    }
  }

  private func requestAccess(for entity: EKEntityType) async throws -> Bool {
    if #available(iOS 17.0, *) {
      switch entity {
      case .event:
        return try await eventStore.requestFullAccessToEvents()
      case .reminder:
        return try await eventStore.requestFullAccessToReminders()
      @unknown default:
        return false
      }
    } else {
      return try await withCheckedThrowingContinuation { continuation in
        eventStore.requestAccess(to: entity) { granted, error in
          if let error {
            continuation.resume(throwing: error)
          } else {
            continuation.resume(returning: granted)
          }
        }
      }
    }
  }

  @MainActor
  private func open(_ url: URL) async -> Bool {
    await UIApplication.shared.open(url)
  }
}

private extension Date {
  var iso8601String: String {
    ISO8601DateFormatter().string(from: self)
  }
}

private extension ISO8601DateFormatter {
  func fallbackDate(from string: String) -> Date? {
    formatOptions = [.withInternetDateTime]
    return date(from: string)
  }
}
