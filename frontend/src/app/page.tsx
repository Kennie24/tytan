import Navbar from "@/components/layout/Navbar";
import FloatingPlayer from "@/components/layout/FloatingPlayer";
import HeroSection from "@/components/sections/HeroSection";
import AlbumShowcase from "@/components/sections/AlbumShowcase";
import MusicPlayer from "@/components/sections/MusicPlayer";
import AlbumsStore from "@/components/sections/AlbumsStore";
import VideosGallery from "@/components/sections/VideosGallery";
import AboutArtist from "@/components/sections/AboutArtist";
import TourEvents from "@/components/sections/TourEvents";
import FanClub from "@/components/sections/FanClub";
import MerchStore from "@/components/sections/MerchStore";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/layout/Footer";
import FlowArt, { FlowSection } from "@/components/ui/story-scroll";

export default function Home() {
  return (
    <>
      {/* Sticky Navbar */}
      <Navbar />

      {/* Floating music player */}
      <FloatingPlayer />

      {/* GSAP story scroll with pinned rotating sections */}
      <FlowArt aria-label="Tytan Takuba cinematic story scroll" className="story-flow bg-black">
        <FlowSection aria-label="Hero landing" style={{ backgroundColor: "#020204", color: "#fff" }}>
          <HeroSection />
        </FlowSection>

        <FlowSection aria-label="Latest album showcase" style={{ backgroundColor: "#EB1F31", color: "#fff" }}>
          <AlbumShowcase />
        </FlowSection>

        <FlowSection aria-label="Music player experience" style={{ backgroundColor: "#050B1F", color: "#fff" }}>
          <MusicPlayer />
        </FlowSection>

        <FlowSection aria-label="Albums store" style={{ backgroundColor: "#763895", color: "#fff" }}>
          <AlbumsStore />
        </FlowSection>

        <FlowSection aria-label="Music videos gallery" style={{ backgroundColor: "#061018", color: "#fff" }}>
          <VideosGallery />
        </FlowSection>

        <FlowSection aria-label="About the artist" style={{ backgroundColor: "#000000", color: "#fff" }}>
          <AboutArtist />
        </FlowSection>

        <FlowSection aria-label="Tour and events" style={{ backgroundColor: "#CEF56A", color: "#000" }}>
          <TourEvents />
        </FlowSection>

        <FlowSection aria-label="Fan club membership" style={{ backgroundColor: "#100822", color: "#fff" }}>
          <FanClub />
        </FlowSection>

        <FlowSection aria-label="Merchandise store" style={{ backgroundColor: "#061512", color: "#fff" }}>
          <MerchStore />
        </FlowSection>

        <FlowSection aria-label="Contact and booking" style={{ backgroundColor: "#16060E", color: "#fff" }}>
          <Contact />
        </FlowSection>

        <FlowSection aria-label="Footer" style={{ backgroundColor: "#000000", color: "#fff" }}>
          <Footer />
        </FlowSection>
      </FlowArt>
    </>
  );
}
