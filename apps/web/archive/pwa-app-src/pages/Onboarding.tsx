import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "/images/hero1.webp", // Replace with your image path
      title: "Real-time Updates",
      description: "Get instant alerts when power goes out or is restored"
    },
    {
      image: "/images/hero2.webp", // Replace with your image path
      title: "Community Reporting",
      description: "Report outages and help your neighbors stay informed"
    },
    {
      image: "/images/hero3.webp", // Replace with your image path
      title: "Interactive Heatmap",
      description: "Visualize power status across your entire city"
    }
  ];

  // Auto-slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <main className="flex min-h-screen flex-col bg-white px-6 py-8">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center border-b border-gray-100 pb-3">
          <img src="/icon.svg" alt="PowerWatch" className="h-8 w-8" />
        </div>

        {/* Carousel with Images */}
        <div className="relative mt-8 mb-8 h-72 w-full overflow-hidden rounded-2xl bg-gray-100">
          {/* Slides */}
          <div 
            className="flex h-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div
                key={index}
                className="relative h-full w-full flex-shrink-0"
              >
                {/* Image */}
                <img 
                  src={slide.image} 
                  alt={slide.title}
                  className="h-full w-full object-cover"
                />
                
                {/* Dark Gradient Overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Text Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                  <h3 className="text-xl font-bold text-white">
                    {slide.title}
                  </h3>
                  <p className="mt-1 text-sm text-white/80">
                    {slide.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-lg transition hover:bg-white hover:scale-110"
          >
            <ChevronLeft size={18} className="text-gray-700" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-lg transition hover:bg-white hover:scale-110"
          >
            <ChevronRight size={18} className="text-gray-700" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'w-8 bg-white' 
                    : 'w-2 bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Text Content */}
        <div>
          <h2 className="text-3xl font-bold leading-tight text-slate-900">
            Stay informed during
            <br />
            power outages
          </h2>

          <p className="mt-4 text-base leading-7 text-gray-500">
            Join your community in tracking real-time power status and reporting
            outages in your neighborhood.
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-auto space-y-3 pt-10">
          <button 
            onClick={() => navigate("/register")}
            className="h-14 w-full rounded-full bg-[#0663EA] text-lg font-semibold text-white transition hover:bg-blue-700 active:scale-95"
          >
            Get Started
          </button>

          <button
            onClick={() => navigate("/login")}
            className="h-14 w-full rounded-full bg-gray-100 text-lg font-semibold text-[#0663EA] transition hover:bg-gray-200 active:scale-95"
          >
            Login
          </button>
        </div>
      </div>
    </main>
  );
};

export default Onboarding;