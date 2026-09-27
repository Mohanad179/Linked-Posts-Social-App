import { Footer, FooterCopyright, FooterLinkGroup, FooterIcon } from "flowbite-react";
import { FaGithub } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";
import { SiGmail } from "react-icons/si";

export default function FooterComponent() {
  return (
    <Footer container className="rounded-none border-t border-gray-200 dark:border-gray-800">
      <div className="w-full flex flex-col items-center justify-between gap-4 sm:flex-row">
        <FooterCopyright href="#" by="LinkedPosts™" year={2026} />

        {/* Center: Author Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full dark:bg-gray-800 dark:text-gray-300">
          <span>Made by</span>
          <a
            href="https://github.com/Mohanad179"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Mohanad
          </a>
        </div>

        {/* Right side: Links */}
        <FooterLinkGroup className="gap-3">
          <FooterIcon href="https://github.com/Mohanad179" icon={FaGithub} />
          <FooterIcon href="https://linkedin.com/in/mohanad-abdelghafar" icon={FaLinkedinIn} />
          <FooterIcon href="https://www.instagram.com/mohanad.mohameddd/" icon={AiFillInstagram} />
          <FooterIcon href="mailto:mohanad.moh179@gmail.com" icon={SiGmail} />
        </FooterLinkGroup>
      </div>
    </Footer>
  );
}