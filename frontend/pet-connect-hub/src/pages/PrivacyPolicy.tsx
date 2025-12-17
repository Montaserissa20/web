import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function PrivacyPolicy() {
  const lastUpdated = 'November 28, 2025';

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container-custom max-w-4xl">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Content */}
        <Card className="shadow-lg">
          <CardContent className="p-8 md:p-12 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                1. Introduction
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to PetMarket ("we," "our," or "us"). We are committed to protecting your 
                personal information and your right to privacy. This Privacy Policy explains how 
                we collect, use, disclose, and safeguard your information when you visit our 
                website and use our animal marketplace services. Please read this policy carefully 
                to understand our views and practices regarding your personal data and how we will 
                treat it.
              </p>
            </section>

            <Separator />

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                2. Information We Collect
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We collect information that you provide directly to us, as well as information 
                that is automatically collected when you use our services:
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Personal Information
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Name and display name</li>
                    <li>Email address</li>
                    <li>Phone number (optional)</li>
                    <li>Country and city of residence</li>
                    <li>Profile pictures and avatars</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Listing Information
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Animal descriptions, photos, and details</li>
                    <li>Pricing and availability information</li>
                    <li>Location data for listings</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Automatically Collected Information
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>IP address and device identifiers</li>
                    <li>Browser type and version</li>
                    <li>Pages visited and time spent on pages</li>
                    <li>Referring website addresses</li>
                  </ul>
                </div>
              </div>
            </section>

            <Separator />

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use the information we collect for various purposes, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>To provide, maintain, and improve our marketplace services</li>
                <li>To create and manage your user account</li>
                <li>To process and display your animal listings</li>
                <li>To facilitate communication between buyers and sellers</li>
                <li>To send you updates, newsletters, and promotional materials (with your consent)</li>
                <li>To detect, prevent, and address fraud or security issues</li>
                <li>To comply with legal obligations and enforce our terms</li>
                <li>To analyze usage patterns and improve user experience</li>
              </ul>
            </section>

            <Separator />

            {/* Cookies & Tracking Technologies */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                4. Cookies & Tracking Technologies
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use cookies and similar tracking technologies to collect and track information 
                about your browsing activities. Cookies are small data files stored on your device 
                that help us improve your experience.
              </p>
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Types of Cookies We Use:</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
                    <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site</li>
                    <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                    <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
                  </ul>
                </div>
                <p className="text-muted-foreground">
                  You can control cookies through your browser settings. However, disabling certain 
                  cookies may limit your ability to use some features of our website.
                </p>
              </div>
            </section>

            <Separator />

            {/* User Accounts & Personal Data */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                5. User Accounts & Personal Data
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When you create an account on PetMarket, we store your registration information 
                securely. You can access, update, or delete your personal information at any time 
                through your account settings.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Your account data is retained as long as your account remains active. If you 
                choose to delete your account, we will remove your personal data within 30 days, 
                except where we are required to retain certain information for legal or legitimate 
                business purposes.
              </p>
            </section>

            <Separator />

            {/* Data Sharing & Third Parties */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                6. Data Sharing & Third Parties
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell your personal information. We may share your data in the following 
                circumstances:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Service Providers:</strong> With vendors who help us operate our platform (hosting, analytics, customer support)</li>
                <li><strong>Other Users:</strong> Your public profile and listing information is visible to other marketplace users</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>With Your Consent:</strong> When you have given us explicit permission</li>
              </ul>
            </section>

            <Separator />

            {/* Security */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                7. Security
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We implement appropriate technical and organizational security measures to protect 
                your personal information against unauthorized access, alteration, disclosure, or 
                destruction. These measures include:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure password hashing</li>
                <li>Regular security audits and assessments</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Employee training on data protection</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                However, no method of transmission over the Internet or electronic storage is 100% 
                secure. While we strive to protect your personal information, we cannot guarantee 
                its absolute security.
              </p>
            </section>

            <Separator />

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                8. Children's Privacy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our services are not intended for children under the age of 18. We do not knowingly 
                collect personal information from children under 18. If you are a parent or guardian 
                and believe that your child has provided us with personal information, please contact 
                us immediately. If we discover that we have collected personal information from a 
                child under 18 without parental consent, we will take steps to delete that information.
              </p>
            </section>

            <Separator />

            {/* Your Rights & How to Contact Us */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                9. Your Rights & How to Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Depending on your location, you may have the following rights regarding your personal data:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Restriction:</strong> Request limitation of processing of your data</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Objection:</strong> Object to processing of your personal data</li>
              </ul>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-foreground font-medium mb-2">Contact Us:</p>
                <p className="text-muted-foreground">
                  Email: privacy@petmarket.com<br />
                  Address: 123 Pet Street, Animal City, AC 12345<br />
                  Phone: +1 (555) 123-4567
                </p>
              </div>
            </section>

            <Separator />

            {/* Updates to This Policy */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                10. Updates to This Policy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our 
                practices or for other operational, legal, or regulatory reasons. We will notify 
                you of any material changes by posting the new Privacy Policy on this page and 
                updating the "Last updated" date. We encourage you to review this Privacy Policy 
                periodically for any changes. Your continued use of our services after any 
                modifications indicates your acceptance of the updated Privacy Policy.
              </p>
            </section>
          </CardContent>
        </Card>

        {/* Footer links */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            See also:{' '}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
