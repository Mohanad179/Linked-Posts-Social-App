import { Footer, FooterCopyright, FooterLinkGroup, FooterLink } from "flowbite-react";

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
        <FooterLinkGroup>
          <FooterLink href="#">About</FooterLink>
          <FooterLink href="#">Privacy Policy</FooterLink>
          <FooterLink href="#">Licensing</FooterLink>
          <FooterLink href="#">Contact</FooterLink>
        </FooterLinkGroup>
      </div>
    </Footer>
  );
}