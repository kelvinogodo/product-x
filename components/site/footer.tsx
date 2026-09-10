import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <span className="text-lg font-bold">product x</span>
          <p className="max-w-xs text-sm text-muted-foreground">
            Interactive courses and learning tracks to help you build real, job-ready skills.
          </p>
          <div className="flex gap-3 pt-2 text-muted-foreground">
            <Link href="#" aria-label="Instagram" className="hover:text-foreground">
              <Instagram className="h-5 w-5" />
            </Link>
            <Link href="#" aria-label="Twitter" className="hover:text-foreground">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" aria-label="LinkedIn" className="hover:text-foreground">
              <Linkedin className="h-5 w-5" />
            </Link>
            <Link href="#" aria-label="Facebook" className="hover:text-foreground">
              <Facebook className="h-5 w-5" />
            </Link>
          </div>
        </div>
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground">About</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link href="/courses" className="hover:text-foreground">Browse courses</Link></li>
            <li><Link href="/" className="hover:text-foreground">Our mission</Link></li>
          </ul>
        </div>
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground">Support</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link href="/courses" className="hover:text-foreground">FAQs</Link></li>
            <li><Link href="/" className="hover:text-foreground">Contact us</Link></li>
          </ul>
        </div>
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground">Account</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link href="/login" className="hover:text-foreground">Log in</Link></li>
            <li><Link href="/signup" className="hover:text-foreground">Sign up</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} product x. All rights reserved.
      </div>
    </footer>
  );
}
