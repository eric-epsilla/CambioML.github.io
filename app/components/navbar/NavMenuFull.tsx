'use client';

import { List, X } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import Button from '../Button';

interface NavMenuProps {
  menuItems: {
    label: string;
    links: string[];
  }[];
  makeOnClick: (label: string, link: string, callback: () => void) => () => void;
}

const NavMenu = ({ menuItems, makeOnClick }: NavMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const toggleOpen = useCallback(() => {
    setIsOpen((value) => !value);
  }, []);
  return (
    <>
      <div className="relative">
        <div className="flex flex-row items-center gap-3">
          <div
            onClick={() => {
              toggleOpen();
            }}
            className="
                    p-4
                    border-[1px]
                    border-neutral-200
                    flex
                    flex-row
                    items-center
                    gap-3
                    rounded-full
                    cursor-pointer
                    cover:shadow-md
                    transition
                    "
          >
            {isOpen ? <X /> : <List />}
          </div>
        </div>
      </div>
      {isOpen && (
        <div
          className="
                absolute
                shadow-md
                w-[100vw]
                h-[50vh]
                lg:hidden
                bg-cambio-blue
                left-0
                top-[83px]
                z-10
                pb-10
                "
        >
          <div className="w-full flex flex-col justify-center">
            {menuItems.map((item) => (
              <>
                <div
                  className={`w-full h-max flex justify-center text-4xl py-5 font-semibold ${item.links.length === 0 && 'cursor-pointer'}`}
                  onClick={() => {
                    if (item.links.length === 0) {
                      router.push(`/${item.label.toLowerCase()}`);
                      toggleOpen();
                    }
                  }}
                >
                  {item.label}
                </div>
                <div className="flex flex-col align-center justify-center gap-4">
                  {item.links.map((link, i) => (
                    <div
                      key={link + i}
                      onClick={makeOnClick(item.label, link, toggleOpen)}
                      className="w-full h-[20px] flex justify-center text-2xl cursor-pointer hover:text-cambio-blue-0"
                    >
                      {link}
                    </div>
                  ))}
                </div>
              </>
            ))}
            <div className="w-full flex flex-col gap-4 px-20 ">
              <div className="w-full pt-20">
                <Button
                  label="Try Sandbox"
                  onClick={() => {
                    router.push('/sandbox');
                    toggleOpen();
                  }}
                  outline
                />
              </div>
              <div className="w-full">
                <Button
                  label="Get API key"
                  onClick={() => {
                    router.push('/account');
                    toggleOpen();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavMenu;
