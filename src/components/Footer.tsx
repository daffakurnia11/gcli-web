import { Instagram, MessageSquare, Twitter, Youtube } from "lucide-react";
import Link from "next/link";

import Logo from "@/components/Logo";
import { Typography } from "@/components/typography";

export default function Footer() {
  return (
    <footer className="bg-primary-700 border-t border-primary-700 pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="h-12 w-fit mb-6">

            <Logo variant="name" color="white" />
            </div>
            <Typography.Paragraph className="text-gray-dark max-w-sm mb-8 leading-relaxed">
              A FiveM server built for teams who want organized PvP, meaningful preparation, and league-driven competition — not random deathmatch.
            </Typography.Paragraph>
            <div className="flex gap-4">
              {[Twitter, Instagram, Youtube, MessageSquare].map((Icon) => (
                <Link
                  key={Icon.displayName}
                  href="#"
                  className="w-10 h-10 bg-primary-900 border border-secondary-700 rounded-sm flex items-center justify-center text-gray-dark hover:text-secondary-700 hover:border-secondary-700 transition-all"
                  aria-label={`Visit ${Icon.displayName}`}
                >
                  <Icon size={18} />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <Typography.Heading
              level={4}
              type="display"
              className="text-gray-dark uppercase tracking-wider mb-8"
            >
              Quick Links
            </Typography.Heading>
            <ul className="space-y-4">
              {["Home", "Rules", "Ban Appeal", "Store", "Support"].map(
                (link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-primary-100 hover:text-secondary-700 transition-colors"
                    >
                      <Typography.Paragraph as="span">
                        {link}
                      </Typography.Paragraph>
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <Typography.Heading
              level={4}
              type="display"
              className="text-gray-dark uppercase tracking-wider mb-8"
            >
              Legal
            </Typography.Heading>
            <ul className="space-y-4">
              {["Terms of Service", "Privacy Policy", "Refund Policy"].map(
                (link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-primary-100 hover:text-secondary-700 transition-colors"
                    >
                      <Typography.Paragraph as="span">
                        {link}
                      </Typography.Paragraph>
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-900 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-primary-100">
          <Typography.Small>
            © {new Date().getFullYear()} GTA Competitive League Indonesia. All
            rights reserved.
          </Typography.Small>
          <Typography.Small>Not affiliated with Rockstar Games.</Typography.Small>
        </div>
      </div>
    </footer>
  );
}
