import { signOut, useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";

import {
  MdCircleNotifications,
  MdOutlineLogout,
  MdBrightness2,
  MdSunny,
} from "react-icons/md";

import { useRouter } from "next/router";
import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Select,
  SelectItem,
  useDisclosure,
} from "@nextui-org/react";
import i18n from "../../../../i18n";
import Link from "next/link";
import { useTheme } from "next-themes";

export default function NavbarLayout() {

  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const { push } = useRouter();
  const { theme, setTheme } = useTheme();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const logout = [
    {
      title: "Home",
      href: "/",
    },
    {
      title: t("navbar.logout.about"),
      href: "/about",
    },
    {
      title: t("navbar.logout.research"),
      href: "/researches",
    },
  ];

  const admin = [
    {
      title: t("navbar.admin.dashboard"),
      href: "/admin/dashboard",
    },
    {
      title: t("navbar.admin.data"),
      href: "/admin/data_catalogue",
    },
    {
      title: t("navbar.admin.show_data"),
      href: "/admin/show_data",
    },
    {
      title: t("navbar.admin.users"),
      href: "/admin/groups",
    },
  ];

  const user = [
    {
      title: t("navbar.user.dashboard"),
      href: "/user/dashboard",
    },
    {
      title: t("navbar.user.report"),
      href: "/researches",
    },
    {
      title: t("navbar.user.about"),
      href: "/about",
    },
  ];


  const navItems = status !== 'authenticated' ? logout : (session?.user && session.user.role === 'admin' ? (session.user.verified) === true ? admin : user : user);

  return (
    <Navbar
      isMenuOpen={isOpen}
      onMenuOpenChange={onOpenChange}
    >
      <NavbarContent>
        <NavbarMenuToggle aria-label={isOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"></NavbarMenuToggle>
        <NavbarBrand>
          <p className="dark:text-white font-bold text-lg text-inherit">SAVE</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {navItems.map((item, index) => (
          <NavbarItem key={index}>
            <Link className="dark:text-white dark:hover:text-zinc-200 hover:text-zinc-800 font-medium text-lg" href={item.href}>{item.title}</Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">

        <NavbarItem>
          <MdSunny size={25} className={`cursor-pointer text-white hidden dark:block`} onClick={() => setTheme('light')} />
          <MdBrightness2 size={25} className={`cursor-pointer dark:text-black dark:hidden block`} onClick={() => setTheme('dark')} />
        </NavbarItem>
        {
          status === 'authenticated' ? (
            <>
              <NavbarItem>
                <NotificationDropdown />
              </NavbarItem>
              <NavbarItem>
                <MdOutlineLogout className="cursor-pointer hover:text-zinc-500 dark:text-white dark:hover:text-zinc-200" onClick={() => signOut()} size={25} />
              </NavbarItem>
            </>
          )
            : (
              <NavbarItem>
                <Button className={"py-2 w-full dark:text-white dark:hover:bg-zinc-200 bg-zinc-800 text-white"} onClick={() => push('/')}>
                  Login
                </Button>
              </NavbarItem>
            )
        }
      </NavbarContent>

      <NavbarMenu>
        {navItems.map((item, index) => (
          <NavbarMenuItem key={`${item.href}-${index}`}>
            <Link
              className="w-full dark:text-white dark:hover:text-zinc-200 hover:text-zinc-800 font-medium text-lg"
              href={item.href}
              onClick={() => onOpenChange()}
            >
              {item.title}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}



import { useState } from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";

function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly variant="light">
          <MdCircleNotifications className="text-black dark:text-white cursor-pointer" size={25} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Notifications">
        {notifications.length === 0 ? (
          <DropdownItem key="empty" className="text-center text-gray-500">
            Sua caixa de entrada está vazia.
          </DropdownItem>
        ) : (
          notifications.map((notification, index) => (
            <DropdownItem key={index}>{notification}</DropdownItem>
          ))
        )}
      </DropdownMenu>
    </Dropdown>
  );
}
