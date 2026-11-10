import React, { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import SlidingMenu from '../components/SlidingMenu';
import ValidationBanner from '../components/ValidationBanner';
import LoadingContent from '../components/LoadingContent';

const MainLayout = () => {
  const [isSlidingMenuOpen, setSlidingMenuOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen w-full flex bg-canvas">
      <div className="hidden lg:block shrink-0 bg-white border-r border-cool-gray-200">
        <SideMenu />
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="lg:hidden">
          <Header openSlidingMenu={setSlidingMenuOpen} />
        </div>
        <SlidingMenu isOpen={isSlidingMenuOpen} setSlidingMenuOpen={setSlidingMenuOpen} />
        <main className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 xl:px-10 py-5 sm:py-6 xl:py-8 flex flex-col gap-6">
          <ValidationBanner />
          {/* pages load lazily: the menu and header stay while a page's chunk arrives */}
          <Suspense fallback={<LoadingContent />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
