import { Link } from 'react-router-dom';
import { Map, Users, Shield, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SiteMap() {
  const sections = [
    {
      title: 'Public Pages',
      icon: Globe,
      links: [
        { href: '/', label: 'Home' },
        { href: '/browse', label: 'Browse Animals' },
        { href: '/faq', label: 'FAQ / Q&A' },
        { href: '/announcements', label: 'News & Announcements' },
        { href: '/sitemap', label: 'Site Map' },
        { href: '/privacy', label: 'Privacy Policy' },
        { href: '/terms', label: 'Terms of Service' },
      ],
    },
    {
      title: 'User Account',
      icon: Users,
      links: [
        { href: '/login', label: 'Login' },
        { href: '/register', label: 'Register' },
        { href: '/forgot-password', label: 'Forgot Password' },
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/dashboard/listings', label: 'My Listings' },
        { href: '/dashboard/favorites', label: 'Favorites' },
        { href: '/dashboard/settings', label: 'Settings' },
      ],
    },
    {
      title: 'Admin Panel',
      icon: Shield,
      links: [
        { href: '/admin', label: 'Admin Dashboard' },
        { href: '/admin/users', label: 'Users Management' },
        { href: '/admin/listings', label: 'Listings Management' },
        { href: '/admin/announcements', label: 'Announcements' },
        { href: '/admin/faq', label: 'FAQ Management' },
      ],
    },
    {
      title: 'Moderator Panel',
      icon: Shield,
      links: [
        { href: '/moderator', label: 'Moderator Dashboard' },
        { href: '/moderator/pending', label: 'Pending Listings' },
        { href: '/moderator/reports', label: 'Reported Listings' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container-custom">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Map className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Site Map</h1>
          <p className="text-muted-foreground">Navigate all pages on PetMarket</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {sections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <section.icon className="h-5 w-5 text-primary" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
