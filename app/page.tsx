import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Enhanced background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-20 -right-10 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-secondary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-56 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        
        {/* Additional decorative elements */}
        <div className="absolute top-[15%] left-[20%] w-32 h-32 bg-pink-50 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
        <div className="absolute bottom-[20%] right-[15%] w-40 h-40 bg-blue-50 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
      </div>
      
      <div className="max-w-md w-full space-y-12 relative z-10">
        <div className="flex flex-col items-center animate-slide-up">
          <div className="w-32 h-32 mb-5 relative"> {/* Increased size */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-full animate-pulse-slow"></div>
            <div className="absolute inset-0 border-2 border-dashed border-primary-200 rounded-full opacity-70 animate-spin" style={{ animationDuration: '20s' }}></div>
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Enhanced detailed RAG illustration */}
              <svg 
                viewBox="0 0 100 100" 
                width="100" 
                height="100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="animate-float"
                style={{ filter: "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.1))" }}
              >
                {/* Document background with shadow */}
                <g filter="url(#document-shadow)">
                  <rect x="15" y="10" width="45" height="60" rx="4" fill="#F5F7FF" />
                  <rect x="15" y="10" width="45" height="60" rx="4" stroke="#E0E7FF" strokeWidth="1" />
                </g>
                
                {/* Document content elements */}
                <rect x="22" y="18" width="30" height="4" rx="2" fill="#6366F1" />
                <rect x="22" y="26" width="26" height="3" rx="1.5" fill="#A5B4FC" />
                <rect x="22" y="32" width="30" height="3" rx="1.5" fill="#A5B4FC" />
                <rect x="22" y="38" width="20" height="3" rx="1.5" fill="#C7D2FE" />
                <rect x="22" y="44" width="25" height="3" rx="1.5" fill="#C7D2FE" />
                <rect x="22" y="50" width="30" height="3" rx="1.5" fill="#A5B4FC" />
                <rect x="22" y="56" width="16" height="3" rx="1.5" fill="#C7D2FE" />
                
                {/* AI Circle with glowing effect */}
                <g filter="url(#glow-effect)">
                  <circle cx="65" cy="60" r="20" fill="url(#ai-gradient)" />
                </g>
                
                {/* Neural network nodes */}
                <circle cx="65" cy="50" r="3" fill="white" />
                <circle cx="55" cy="60" r="3" fill="white" />
                <circle cx="65" cy="70" r="3" fill="white" />
                <circle cx="75" cy="60" r="3" fill="white" />
                <circle cx="60" cy="55" r="2" fill="white" opacity="0.7" />
                <circle cx="70" cy="55" r="2" fill="white" opacity="0.7" />
                <circle cx="60" cy="65" r="2" fill="white" opacity="0.7" />
                <circle cx="70" cy="65" r="2" fill="white" opacity="0.7" />
                
                {/* Network connections */}
                <path d="M65 50L55 60" stroke="white" strokeWidth="1.5" />
                <path d="M65 50L75 60" stroke="white" strokeWidth="1.5" />
                <path d="M55 60L65 70" stroke="white" strokeWidth="1.5" />
                <path d="M75 60L65 70" stroke="white" strokeWidth="1.5" />
                <path d="M65 50L65 70" stroke="white" strokeWidth="1" strokeDasharray="2 2" />
                <path d="M55 60L75 60" stroke="white" strokeWidth="1" strokeDasharray="2 2" />
                
                {/* Document to AI connections */}
                <path d="M40 30L55 50" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M40 40L55 60" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M40 50L55 70" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" />
                
                {/* Animated data particles */}
                <circle className="animate-pulse-slow" cx="47" cy="35" r="1.5" fill="#4F46E5" opacity="0.8" />
                <circle className="animate-pulse-slow" cx="48" cy="55" r="1.5" fill="#4F46E5" opacity="0.8" style={{animationDelay: "0.5s"}} />
                <circle className="animate-pulse-slow" cx="45" cy="45" r="1.5" fill="#4F46E5" opacity="0.8" style={{animationDelay: "1s"}} />
                
                {/* Filter definitions */}
                <defs>
                  <filter id="document-shadow" x="12" y="8" width="51" height="66" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
                    <feOffset dy="2"/>
                    <feGaussianBlur stdDeviation="2"/>
                    <feComposite in2="hardAlpha" operator="out"/>
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/>
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
                  </filter>
                  <filter id="glow-effect" x="40" y="35" width="50" height="50" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                    <feGaussianBlur stdDeviation="2" result="effect1_foregroundBlur"/>
                  </filter>
                  <radialGradient id="ai-gradient" cx="65" cy="60" r="20" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#6366F1"/>
                    <stop offset="100%" stopColor="#4338CA"/>
                  </radialGradient>
                </defs>
              </svg>
            </div>
          </div>
          
          <h1 className="text-center text-4xl font-bold text-neutral-900 font-display tracking-tight mt-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
              RAG Assistant
            </span>
          </h1>
          
          <p className="mt-3 text-center text-xl text-neutral-600 max-w-sm">
            Chat with your documents using AI-powered intelligence
          </p>
          
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {/* Enhanced feature badges */}
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium bg-primary-50 text-primary-800 border border-primary-200 shadow-sm transition-all hover:scale-105 duration-200">
              <svg className="w-4 h-4 mr-1.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 13.333C10.9455 13.333 13.3333 10.9452 13.3333 7.99967C13.3333 5.05416 10.9455 2.66634 8 2.66634C5.05448 2.66634 2.66667 5.05416 2.66667 7.99967C2.66667 10.9452 5.05448 13.333 8 13.333Z" stroke="#4338CA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="#4338CA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.5 6.5L11.5 4.5" stroke="#4338CA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.5 9.5L4.5 11.5" stroke="#4338CA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.5 9.5L11.5 11.5" stroke="#4338CA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.5 6.5L4.5 4.5" stroke="#4338CA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              AI-Powered
            </span>
            
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium bg-secondary-50 text-secondary-800 border border-secondary-200 shadow-sm transition-all hover:scale-105 duration-200">
              <svg className="w-4 h-4 mr-1.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.3335 1.33301H4.00016C3.26683 1.33301 2.6735 1.93301 2.6735 2.66634V13.333C2.6735 14.0663 3.26683 14.6663 4.00016 14.6663H12.0002C12.7335 14.6663 13.3335 14.0663 13.3335 13.333V5.33301L9.3335 1.33301Z" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.33333 1.33301V5.33301H13.3333" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.6667 8.66699H5.33333" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.6667 11.333H5.33333" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.66667 6.00033H6.00001H5.33334" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              PDF Support
            </span>
            
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium bg-purple-50 text-purple-800 border border-purple-200 shadow-sm transition-all hover:scale-105 duration-200">
              <svg className="w-4 h-4 mr-1.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2.66699C4.68667 2.66699 2.00001 5.35366 2.00001 8.66699C2.00001 11.9803 4.68667 14.667 8 14.667C11.3133 14.667 14 11.9803 14 8.66699C14 5.35366 11.3133 2.66699 8 2.66699Z" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.72668 10.9403C5.72668 10.9403 6.84001 9.33366 8.00001 9.33366C9.16001 9.33366 10.2733 10.9403 10.2733 10.9403" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.33334 6.66699H5.34C5.56034 6.66699 5.73334 6.83999 5.73334 7.06033C5.73334 7.28066 5.56034 7.45366 5.34 7.45366C5.11967 7.45366 4.94667 7.28066 4.94667 7.06033C4.94667 6.83999 5.11967 6.66699 5.33334 6.66699" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.6667 6.66699H10.6733C10.8937 6.66699 11.0667 6.83999 11.0667 7.06033C11.0667 7.28066 10.8937 7.45366 10.6733 7.45366C10.453 7.45366 10.28 7.28066 10.28 7.06033C10.28 6.83999 10.453 6.66699 10.6667 6.66699" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Semantic Search
            </span>
          </div>
        </div>
        
        <div className="space-y-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {/* Enhanced primary button with hover effect */}
          <Link 
            href="/chat" 
            className="group relative w-full flex items-center justify-center py-4 px-5 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 overflow-hidden"
          >
            {/* Subtle hover effect overlay */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <svg className="h-6 w-6 mr-2 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.4183 16.9706 20 12 20C10.4607 20 9.01172 19.6565 7.74467 19.0511L3 20L4.39499 16.28C3.51156 15.0423 3 13.5743 3 12C3 7.58172 7.02944 4 12 4C16.9706 4 21 7.58172 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Start Chatting
          </Link>
          
          {/* Enhanced secondary button */}
          <Link
            href="/settings"
            className="group relative w-full flex items-center justify-center py-3.5 px-5 border border-neutral-200 text-lg font-medium rounded-xl text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 transition-all duration-200 shadow-sm hover:shadow transform hover:-translate-y-1"
          >
            <svg className="h-5 w-5 mr-2 text-neutral-500 group-hover:text-primary-500 transition-colors duration-200" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.70008 16.6667C8.43098 16.9083 9.21345 17.0333 10.0001 17.0333C13.6816 17.0333 16.6667 14.0482 16.6667 10.3667C16.6667 6.68517 13.6816 3.70001 10.0001 3.70001C6.31853 3.70001 3.33337 6.68517 3.33337 10.3667C3.33337 11.1533 3.45837 11.9358 3.70003 12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7.5 10C7.5 11.3807 8.61929 12.5 10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12.5 10C12.5 11.3807 11.3807 12.5 10 12.5C8.61929 12.5 7.5 11.3807 7.5 10C7.5 8.61929 8.61929 7.5 10 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M8.33337 16.6667L6.66671 15.8333L5.00004 16.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6.66663 15V13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Settings
          </Link>
        </div>
        
        <div className="text-center mt-8 text-sm text-neutral-500 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p>Upload documents and ask questions in natural language</p>
          <p className="mt-2 flex items-center justify-center">
            <svg className="w-4 h-4 mr-1.5 text-primary-400" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.99992 14.6667C11.6818 14.6667 14.6666 11.6819 14.6666 8.00004C14.6666 4.31814 11.6818 1.33337 7.99992 1.33337C4.31802 1.33337 1.33325 4.31814 1.33325 8.00004C1.33325 11.6819 4.31802 14.6667 7.99992 14.6667Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 5.33337V8.00004" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 10.6666H8.00667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Built with Retrieval-Augmented Generation technology
          </p>
          
          {/* Enhanced footer links */}
          <div className="mt-6 flex justify-center space-x-5">
            <a href="#" className="text-primary-500 hover:text-primary-600 transition-colors flex items-center">
              <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7" cy="7" r="6.25" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M7 3.5V7L9.33333 8.16667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              About
            </a>
            <a href="#" className="text-primary-500 hover:text-primary-600 transition-colors flex items-center">
              <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2.33333" y="1.75" width="9.33333" height="10.5" rx="1.16667" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M4.66667 5.25H9.33334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M4.66667 8.75H7.00001" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Privacy
            </a>
            <a href="#" className="text-primary-500 hover:text-primary-600 transition-colors flex items-center">
              <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2.33333" y="1.75" width="9.33333" height="10.5" rx="1.16667" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M4.66667 4.08333H9.33334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M4.66667 7H9.33334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M4.66667 9.91667H7.00001" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Terms
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
