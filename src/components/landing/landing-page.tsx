"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import BlurText from "@/components/BlurText";
import GradientText from "@/components/GradientText";
import ShinyText from "@/components/ShinyText";
import DecryptedText from "@/components/DecryptedText";
import StarBorder from "@/components/StarBorder";
import Magnet from "@/components/Magnet";
import ScrollVelocity from "@/components/ScrollVelocity";
import TrueFocus from "@/components/TrueFocus";
import MagicBento from "@/components/MagicBento";
import ChromaGrid from "@/components/ChromaGrid";
import ElectricBorder from "@/components/ElectricBorder";
import PixelCard from "@/components/PixelCard";
import ProfileCard from "@/components/ProfileCard";
import TiltedCard from "@/components/TiltedCard";
import Dock from "@/components/Dock";
import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack";
import GradualBlur from "@/components/GradualBlur";
import StickerPeel from "@/components/StickerPeel";

const DarkVeil = dynamic(() => import("@/components/DarkVeil"), { ssr: false });
const LightRays = dynamic(() => import("@/components/LightRays"), { ssr: false });
const MetaBalls = dynamic(() => import("@/components/MetaBalls"), { ssr: false });
const FlyingPosters = dynamic(() => import("@/components/FlyingPosters"), { ssr: false });
const LaserFlow = dynamic(() => import("@/components/LaserFlow"), { ssr: false });
const CircularGallery = dynamic(() => import("@/components/CircularGallery"), { ssr: false });

const CHROMA_ITEMS = [
  {
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80",
    title: "Inbox zero",
    subtitle: "Draft, sort, send",
    handle: "Morning triage",
    borderColor: "#FF9500",
    gradient: "linear-gradient(145deg,#FF9500,#000)",
  },
  {
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80",
    title: "Travel",
    subtitle: "Flights, hotels, rides",
    handle: "Trip planning",
    borderColor: "#64D2FF",
    gradient: "linear-gradient(210deg,#64D2FF,#000)",
  },
  {
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80",
    title: "Meetings",
    subtitle: "Schedule + follow up",
    handle: "Calendar ops",
    borderColor: "#BF5AF2",
    gradient: "linear-gradient(165deg,#BF5AF2,#000)",
  },
  {
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80",
    title: "Errands",
    subtitle: "Book, order, remind",
    handle: "Life admin",
    borderColor: "#30D158",
    gradient: "linear-gradient(195deg,#30D158,#000)",
  },
  {
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80",
    title: "Research",
    subtitle: "Summarize + decide",
    handle: "Deep work",
    borderColor: "#FF375F",
    gradient: "linear-gradient(180deg,#FF375F,#000)",
  },
];

const POSTERS = [
  "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
  "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
];

const GALLERY_ITEMS = [
  { image: POSTERS[0], text: "Inbox" },
  { image: POSTERS[1], text: "Travel" },
  { image: POSTERS[2], text: "Life" },
  { image: CHROMA_ITEMS[0].image, text: "Inbox" },
  { image: CHROMA_ITEMS[1].image, text: "Travel" },
  { image: CHROMA_ITEMS[3].image, text: "Errands" },
  { image: CHROMA_ITEMS[4].image, text: "Research" },
  { image: POSTERS[2], text: "Life" },
];

export function LandingPage() {
  const [email, setEmail] = useState("");
  const [submitState, setSubmitState] = useState<
    "idle" | "loading" | "joined" | "already_joined" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const joinWaitlist = useMutation(api.waitlist.join);

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setSubmitState("loading");
    setErrorMessage("");

    try {
      const result = await joinWaitlist({
        email: trimmed,
        source: "landing",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      });
      setSubmitState(result.status);
    } catch (error) {
      setSubmitState("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong. Try again.");
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-5 md:px-10">
        <ShinyText
          text="Freya"
          className="text-sm font-semibold tracking-[0.2em] uppercase"
          color="#888"
          shineColor="#fff"
          speed={3}
        />
        <nav className="hidden gap-8 text-sm text-white/60 md:flex">
          <a href="#product" className="hover:text-white">
            Product
          </a>
          <a href="#use-cases" className="hover:text-white">
            Use cases
          </a>
          <a href="#waitlist" className="hover:text-white">
            Waitlist
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section
        id="product"
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-16 text-center"
      >
        <div className="absolute inset-0 opacity-40">
          <DarkVeil hueShift={28} speed={0.35} warpAmount={0.2} noiseIntensity={0.02} />
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(255,149,0,0.2) 0%, transparent 60%), #000",
          }}
        />
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <LightRays
            raysColor="#FF9500"
            raysOrigin="top-center"
            raysSpeed={0.6}
            lightSpread={0.9}
            rayLength={1.4}
            followMouse
            mouseInfluence={0.12}
            noiseAmount={0}
            distortion={0}
          />
        </div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center">
          <p className="mb-6 text-xs font-medium uppercase tracking-[0.35em] text-white/50">
            AI assistant · your phone · private beta
          </p>

          <BlurText
            text="Hermes for iPhone."
            delay={80}
            animateBy="words"
            direction="bottom"
            className="justify-center text-[clamp(3rem,11vw,7rem)] font-semibold leading-[0.95] tracking-tight text-white"
            animationFrom={{ filter: "blur(16px)", opacity: 0, y: 40 }}
            animationTo={[{ filter: "blur(0px)", opacity: 1, y: 0 }]}
          />

          <div className="mt-6 max-w-2xl">
            <GradientText
              colors={["#FF9500", "#FFD60A", "#FF6B00", "#FFFFFF"]}
              animationSpeed={6}
              className="text-[clamp(1.1rem,3vw,1.75rem)] font-bold"
            >
              The assistant your phone deserved. Not another chatbot demo.
            </GradientText>
          </div>

          <div className="mt-8 max-w-xl text-lg text-white/60">
            <DecryptedText
              text="Small team. Loud opinion. We built Freya because Siri keeps apologising instead of acting."
              animateOn="view"
              speed={35}
              maxIterations={12}
              className="leading-relaxed"
              encryptedClassName="text-white/30"
            />
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Magnet padding={80} magnetStrength={4}>
              <StarBorder as="a" href="#waitlist" color="#FF9500" speed="5s">
                <span className="px-2 text-sm font-semibold">Get early access</span>
              </StarBorder>
            </Magnet>
            <a
              href="#use-cases"
              className="text-sm text-white/50 underline-offset-4 hover:text-white hover:underline"
            >
              See what it actually does
            </a>
          </div>
        </div>

        <div className="relative z-10 mt-16 w-full max-w-md px-4">
          <TiltedCard
            imageSrc="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=900&q=80&sat=-20"
            altText="Freya on iPhone"
            captionText="Freya"
            containerHeight="320px"
            imageWidth="260px"
            imageHeight="320px"
            rotateAmplitude={16}
            showMobileWarning={false}
            displayOverlayContent
            overlayContent={
              <div className="rounded-xl bg-black/70 px-4 py-3 text-left backdrop-blur-md">
                <p className="text-xs text-white/50">You</p>
                <p className="text-sm text-white">Move my 3pm and tell the client.</p>
              </div>
            }
          />
        </div>
      </section>

      <div className="border-y border-white/10 bg-black py-4">
        <ScrollVelocity
          texts={[
            <span key="a" className="text-sm font-medium text-white/80">
              Reschedule meetings · Draft in your voice · Book dinner · Summarize threads · Set reminders · Plan travel ·
              Run errands ·
            </span>,
          ]}
          velocity={50}
        />
      </div>

      <section className="bg-black px-6 py-24 md:px-10">
        <TrueFocus
          sentence="listen remember act approve repeat"
          separator=" "
          blurAmount={6}
          borderColor="#FF9500"
          glowColor="rgba(255, 149, 0, 0.45)"
          animationDuration={0.4}
          pauseBetweenAnimations={0.6}
        />
        <p className="mx-auto mt-8 max-w-lg text-center text-sm text-white/45">
          That is the whole product. Everything else is details.
        </p>
      </section>

      <section id="use-cases" className="relative px-4 py-10 md:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <ShinyText
            text="WHAT PEOPLE ACTUALLY DELEGATE"
            className="text-xs tracking-[0.35em]"
            color="#666"
            shineColor="#FF9500"
          />
        </div>
        <ScrollStack useWindowScroll itemDistance={120} itemScale={0.04}>
          <ScrollStackItem itemClassName="border border-white/10 bg-[#111] text-white">
            <p className="text-sm text-[#FF9500]">01 · Morning</p>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight">&ldquo;What matters today?&rdquo;</h3>
            <p className="mt-4 max-w-lg text-white/60">
              Calendar, inbox priorities, travel time, and anything that changed overnight. One briefing before your
              first meeting.
            </p>
          </ScrollStackItem>
          <ScrollStackItem itemClassName="bg-[#FF9500] text-black">
            <p className="text-sm opacity-70">02 · Work</p>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight">&ldquo;Handle this thread.&rdquo;</h3>
            <p className="mt-4 max-w-lg opacity-80">
              Summarize a long email chain, draft replies in your tone, and queue them for approval before anything
              sends.
            </p>
          </ScrollStackItem>
          <ScrollStackItem itemClassName="border border-white/10 bg-[#111] text-white">
            <p className="text-sm text-[#64D2FF]">03 · Life</p>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight">&ldquo;Sort it out.&rdquo;</h3>
            <p className="mt-4 max-w-lg text-white/60">
              Book the table, move the appointment, remind you when to leave, text your partner when you are on the way.
            </p>
          </ScrollStackItem>
          <ScrollStackItem itemClassName="bg-white text-black">
            <p className="text-sm opacity-50">04 · Trust</p>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight">Nothing sends without you.</h3>
            <p className="mt-4 max-w-lg opacity-70">
              On-device by default. Cloud only when needed. You approve every message, booking, and purchase.
            </p>
          </ScrollStackItem>
        </ScrollStack>
      </section>

      <GradualBlur
        target="parent"
        position="bottom"
        height="8rem"
        strength={2}
        divCount={4}
        curve="bezier"
        exponential
        opacity={1}
      />

      <section className="relative bg-black py-20">
        <div className="mx-auto mb-12 max-w-2xl px-6 text-center">
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-semibold tracking-tight">Use cases, not buzzwords.</h2>
        </div>
        <ChromaGrid items={CHROMA_ITEMS} radius={280} />
      </section>

      {/* Engine — black throughout, subtle MetaBalls */}
      <section id="engine" className="relative overflow-hidden bg-black py-20">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <MetaBalls
            color="#FF9500"
            speed={0.25}
            enableMouseInteraction
            enableTransparency
          />
        </div>
        <div className="relative mx-auto mb-10 max-w-2xl px-6 text-center">
          <GradientText
            colors={["#ffffff", "#FF9500", "#ffffff"]}
            animationSpeed={10}
            className="text-2xl font-semibold md:text-3xl"
          >
            Under the hood
          </GradientText>
        </div>
        <div className="relative mx-auto max-w-6xl px-4">
          <MagicBento
            glowColor="255, 149, 0"
            enableStars
            enableSpotlight
            enableBorderGlow
            enableTilt
            clickEffect
          />
        </div>
      </section>

      <section className="bg-black px-6 py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row lg:items-start lg:justify-center lg:gap-16">
          <div className="mx-auto w-full max-w-[388px] px-1 [&_section]:!mx-auto [&_section]:!aspect-[0.718] [&_section]:!h-auto [&_section]:!max-h-[540px] [&_section]:!w-full">
            <ProfileCard
              name="Freya"
              title="Your phone, upgraded"
              handle="yourpocket"
              status="Private beta"
              contactText="Join waitlist"
              avatarUrl="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80"
              showUserInfo
              behindGlowEnabled
              behindGlowColor="rgba(255,149,0,0.4)"
              enableTilt
              onContactClick={() => {
                document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
              }}
            />
          </div>

          <div className="w-full max-w-lg">
            <ElectricBorder color="#FF9500" borderRadius={28} speed={1.2} chaos={0.15}>
              <div className="rounded-[26px] bg-[#0a0a0a] p-8">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Example scenario</p>
                <h3 className="mt-3 text-xl font-semibold">Reschedule a dentist appointment</h3>
                <div className="mt-6 space-y-3">
                  <div className="rounded-2xl bg-[#FF9500] px-4 py-3 text-sm text-black">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider opacity-70">You</span>
                    Move my dentist to Thursday afternoon.
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-white/40">Freya</span>
                    Found 2:30 or 4:15. Want me to call and confirm?
                  </div>
                  <div className="rounded-2xl bg-[#FF9500] px-4 py-3 text-sm text-black">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider opacity-70">You</span>
                    2:30 works.
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-white/40">Freya</span>
                    Booked. Calendar updated. Reminder set with travel time.
                  </div>
                </div>
                <p className="mt-6 text-sm leading-relaxed text-white/55">
                  Freya reads your calendar, talks to the clinic, updates the event, and sets a reminder with travel
                  time. You tap approve once.
                </p>
              </div>
            </ElectricBorder>
          </div>
        </div>
      </section>

      <section className="relative bg-black">
        <div className="relative h-[min(520px,55vh)] overflow-hidden border-y border-white/10">
          <FlyingPosters items={POSTERS} />
        </div>

        <div className="relative h-[clamp(420px,56vmin,760px)] min-h-[45vh] w-full">
          <CircularGallery
            items={GALLERY_ITEMS}
            bend={2}
            textColor="#ffffff"
            borderRadius={0.05}
          />
        </div>

        <div id="waitlist" className="relative px-6 pb-24 pt-20 md:px-10">
          <div className="pointer-events-none absolute inset-x-0 -top-56 z-0 h-[min(32rem,50vh)] opacity-90">
            <LaserFlow color="#FF9500" verticalSizing={2.5} horizontalSizing={0.7} />
          </div>

          <div className="relative z-10 mx-auto max-w-xl text-center">
          <BlurText
            text="Want in?"
            className="justify-center text-4xl font-semibold text-white md:text-5xl"
            delay={60}
          />
          <p className="mt-4 text-white/50">
            We are onboarding in small waves. Leave your email. No spam, no keynote, no cult initiation.
          </p>
        </div>

        <div className="relative z-10 mx-auto mt-10 w-full max-w-md px-2">
          <PixelCard variant="default" className="mx-auto w-full max-w-md">
            <form
              className="flex w-[min(100%,280px)] flex-col gap-3 p-4"
              onSubmit={handleWaitlist}
            >
              <label htmlFor="waitlist-email" className="sr-only">
                Email address
              </label>
              <input
                id="waitlist-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (submitState !== "idle" && submitState !== "loading") {
                    setSubmitState("idle");
                  }
                }}
                placeholder="you@email.com"
                disabled={submitState === "loading" || submitState === "joined"}
                className="w-full rounded-xl border border-white/10 bg-black/90 px-4 py-3 text-sm text-white outline-none focus:border-[#FF9500] disabled:opacity-60"
              />
              <StarBorder as="button" type="submit" color="#FF9500">
                {submitState === "loading"
                  ? "Joining..."
                  : submitState === "joined"
                    ? "You are on the list"
                    : submitState === "already_joined"
                      ? "Already on the list"
                      : "Join the waitlist"}
              </StarBorder>
              {submitState === "error" ? (
                <p className="text-center text-xs text-red-400">{errorMessage}</p>
              ) : null}
              {submitState === "already_joined" ? (
                <p className="text-center text-xs text-white/45">That email is already registered.</p>
              ) : null}
            </form>
          </PixelCard>

          <button
            type="button"
            className="mt-8 cursor-grab active:cursor-grabbing"
            aria-label="Peel sticker to join waitlist"
            onClick={() => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" })}
          >
            <StickerPeel
              imageSrc="https://images.unsplash.com/photo-1556656793-08538906a9f8?w=300&q=80"
              width={110}
              rotate={8}
              initialPosition={{ x: 0, y: 0 }}
            />
          </button>
          <p className="mt-2 text-xs text-white/35">Peel it. Drag it. Still ends up on the waitlist.</p>
        </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black px-6 py-10 text-center text-xs text-white/35">
        <p className="font-medium text-white/60">Freya</p>
        <p className="mt-2" suppressHydrationWarning>
          © {new Date().getFullYear()} · Hermes for iPhone · Built by a small team that uses its own product daily
        </p>
      </footer>

      <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
        <Dock
          items={[
            {
              icon: <span className="text-lg">⌂</span>,
              label: "Home",
              onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
            },
            {
              icon: <span className="text-lg">◎</span>,
              label: "Cases",
              onClick: () => document.getElementById("use-cases")?.scrollIntoView({ behavior: "smooth" }),
            },
            {
              icon: <span className="text-lg">✦</span>,
              label: "Join",
              onClick: () => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" }),
            },
          ]}
          panelHeight={56}
          baseItemSize={44}
          magnification={64}
        />
      </div>
    </div>
  );
}
