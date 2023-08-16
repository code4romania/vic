import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import SlidingMenu from '../components/SlidingMenu';

const MainLayout = () => {
  const [isSlidingMenuOpen, setSlidingMenuOpen] = useState<boolean>(false);

  return (
    <div className="w-screen h-screen max-w-full">
      <Header openSlidingMenu={setSlidingMenuOpen} />
      <SlidingMenu isOpen={isSlidingMenuOpen} setSlidingMenuOpen={setSlidingMenuOpen} />
      <section className="flex flex-row sm:p-6 p-4 gap-6">
        <div className="hidden xl:flex">
          <SideMenu />
        </div>
        <div className="w-full overflow-scroll no-scrollbar">
          <Outlet />
        </div>
      </section>
    </div>
  );
};

export default MainLayout;
