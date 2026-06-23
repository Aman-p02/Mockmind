import Link from "next/link";
import { Code2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center">
          <span className="text-xl font-extrabold tracking-tighter text-white">Mockmind</span>
        </div>
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} Mockmind Platform. All rights reserved.
        </p>
        <div className="flex gap-4">
          <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
            Terms
          </Link>
          <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
