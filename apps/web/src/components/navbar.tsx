"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { WalletConnectButton } from "@/components/connect-button"

const navLinks: Array<{ name: string; href: string; external?: boolean }> = [
  { name: "Home", href: "/" },
  { name: "Pools", href: "/pools" },
  { name: "Dashboard", href: "/dashboard" },
]

export function Navbar() {
  const pathname = usePathname()
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-900/80 backdrop-blur-md supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="flex items-center gap-3 mb-8">
                {/* Mobile Logo */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <div className="w-8 h-8 rounded-full border-2 border-yellow-200 flex items-center justify-center">
                      <span className="text-xs font-black text-white">⚡</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-full bg-yellow-400 blur-md opacity-30"></div>
                </div>
                <span className="font-black text-lg bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  LAST MONAD
                </span>
              </div>
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className={`flex items-center gap-2 text-base font-medium transition-colors hover:text-primary ${
                      pathname === link.href ? "text-foreground" : "text-foreground/70"
                    }`}
                  >
                    {link.name}
                    {link.external && <ExternalLink className="h-4 w-4" />}
                  </Link>
                ))}
                <div className="mt-6 pt-6 border-t">
                  <WalletConnectButton />
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
            {/* Coin Icon with spinning animation on hover */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:animate-spin transition-all">
                <div className="w-8 h-8 rounded-full border-2 border-yellow-200 flex items-center justify-center">
                  <span className="text-xs font-black text-white">⚡</span>
                </div>
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-yellow-400 blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
            </div>
            <span className="hidden font-black text-xl sm:inline-block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              LAST MONAD
            </span>
          </Link>
        </div>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href
                  ? "text-foreground"
                  : "text-foreground/70"
              }`}
            >
              {link.name}
              {link.external && <ExternalLink className="h-4 w-4" />}
            </Link>
          ))}
          
          <div className="flex items-center gap-3">
            <WalletConnectButton />
          </div>
        </nav>
      </div>
    </header>
  )
}
