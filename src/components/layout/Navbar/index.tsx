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
  Select,
  SelectItem,
} from "@nextui-org/react";
import i18n from "../../../../i18n";
import Link from "next/link";
import { useTheme } from "next-themes";

export default function NavbarLayout() {
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const { push } = useRouter();
  const { theme, setTheme } = useTheme();

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
      href: "/research",
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
      href: "/user/reports",
    },
    {
      title: t("navbar.user.about"),
      href: "/user/about",
    },
  ];

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
  };

  const languages = [
    {
      title: "English",
      value: "en",
    },
    {
      title: "Português",
      value: "pt-BR",
    },
  ];

  return (
    <Navbar className="flex">
      <NavbarBrand>
        <p className="dark:text-white font-bold text-lg text-inherit">SAVE</p>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {status !== "authenticated"
          ? logout.map((item, index) => (
              <NavbarItem key={index}>
                <Link
                  className="dark:text-white dark:hover:text-zinc-200 hover:text-zinc-800 font-medium text-lg"
                  href={item.href}
                >
                  {item.title}
                </Link>
              </NavbarItem>
            ))
          : (session.user && session.user.role === "admin"
              ? session.user.verified === true
                ? admin
                : user
              : user
            ).map((item, index) => (
              <NavbarItem key={index}>
                <Link
                  className="dark:text-white dark:hover:text-zinc-200 hover:text-zinc-800 font-medium text-lg"
                  href={item.href}
                >
                  {item.title}
                </Link>
              </NavbarItem>
            ))}
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          <Select
            placeholder={t("language")}
            fullWidth
            className="min-w-40"
            defaultSelectedKeys={
              languages.find((lang) => lang.value === i18n.language)?.title
            }
            onChange={(e) => handleLanguageChange(e.target.value)}
          >
            {languages.map((language) => (
              <SelectItem
                key={language.value}
                className="dark:text-white"
                value={language.value}
              >
                {language.title}
              </SelectItem>
            ))}
          </Select>
        </NavbarItem>
        <NavbarItem>
          <MdSunny
            size={25}
            className={`cursor-pointer text-white hidden dark:block`}
            onClick={() => setTheme("light")}
          />
          <MdBrightness2
            size={25}
            className={`cursor-pointer dark:text-black dark:hidden block`}
            onClick={() => setTheme("dark")}
          />
        </NavbarItem>
        {status === "authenticated" ? (
          <>
            <NavbarItem>
              <MdCircleNotifications
                className="dark:text-white dark:hover:text-zinc-200 cursor-pointer hover:text-zinc-800"
                size={25}
              />
            </NavbarItem>
            <NavbarItem>
              <MdOutlineLogout
                className="cursor-pointer hover:text-zinc-500 dark:text-white dark:hover:text-zinc-200"
                onClick={() => signOut()}
                size={25}
              />
            </NavbarItem>
          </>
        ) : (
          <NavbarItem>
            <Button
              className={
                "py-2 w-2/3 dark:text-white dark:hover:bg-zinc-200 bg-zinc-800 text-white"
              }
              onClick={() => push("/")}
            >
              Login
            </Button>
          </NavbarItem>
        )}
      </NavbarContent>
    </Navbar>
  );
}
