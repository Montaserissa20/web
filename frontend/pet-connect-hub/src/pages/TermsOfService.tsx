import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function TermsOfService() {
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
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">
            Terms of Service
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
              <p className="text-muted-foreground leading-relaxed mb-4">
                Welcome to PetMarket. These Terms of Service ("Terms") govern your access to and 
                use of our website, services, and applications (collectively, the "Services"). 
                By accessing or using our Services, you agree to be bound by these Terms.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                PetMarket is an online marketplace that connects animal sellers, breeders, and 
                adopters. We provide a platform for users to list, browse, and inquire about 
                animals available for sale or adoption. Please read these Terms carefully before 
                using our Services.
              </p>
            </section>

            <Separator />

            {/* User Responsibilities */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                2. User Responsibilities
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                As a user of PetMarket, you agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Provide accurate and truthful information in your profile and listings</li>
                <li>Comply with all applicable local, state, national, and international laws and regulations</li>
                <li>Treat animals with care and respect, following ethical standards</li>
                <li>Communicate honestly and respectfully with other users</li>
                <li>Report any suspicious or fraudulent activity to our team</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Not engage in any activity that could harm or disrupt the Services</li>
              </ul>
            </section>

            <Separator />

            {/* Account Creation & Security */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                3. Account Creation & Security
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To access certain features of our Services, you must create an account. When 
                creating an account, you agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Create a strong, unique password and keep it confidential</li>
                <li>Not share your account with others or allow unauthorized access</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You are responsible for all activities that occur under your account. We reserve 
                the right to suspend or terminate accounts that violate these Terms or engage in 
                suspicious activity.
              </p>
            </section>

            <Separator />

            {/* Listing of Animals */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                4. Listing of Animals
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When creating listings on PetMarket, you must adhere to the following guidelines:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Allowed Content:</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Domestic pets (dogs, cats, birds, fish, rabbits, hamsters, etc.)</li>
                    <li>Farm animals where legally permitted</li>
                    <li>Accurate descriptions of health status, age, and breed</li>
                    <li>Clear, recent photographs of the actual animal</li>
                    <li>Honest pricing and availability information</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Prohibited Content:</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Endangered or protected species</li>
                    <li>Wild animals captured from their natural habitat</li>
                    <li>Animals obtained through illegal means</li>
                    <li>Misleading or fraudulent descriptions</li>
                    <li>Stock photos or images of different animals</li>
                    <li>Animals intended for fighting or other illegal activities</li>
                    <li>Any content that promotes animal cruelty or neglect</li>
                  </ul>
                </div>
              </div>
              
              <p className="text-muted-foreground leading-relaxed mt-4">
                All listings are subject to review by our moderation team. We reserve the right 
                to remove any listing that violates these guidelines without prior notice.
              </p>
            </section>

            <Separator />

            {/* Payments */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                5. Payments
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                PetMarket facilitates connections between buyers and sellers but does not directly 
                process payments for animal transactions. Payment arrangements are made directly 
                between parties.
              </p>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-foreground font-medium mb-2">Important Notice:</p>
                <p className="text-muted-foreground text-sm">
                  Payment processing features are currently under development. When implemented, 
                  additional terms regarding fees, refunds, and payment security will be provided. 
                  Until then, exercise caution when making direct payments to sellers and consider 
                  using secure payment methods.
                </p>
              </div>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-4">
                <li>Never send payment before verifying the legitimacy of a listing</li>
                <li>Meet in safe, public locations when possible</li>
                <li>Request documentation for purebred or pedigreed animals</li>
                <li>Report any payment-related fraud immediately</li>
              </ul>
            </section>

            <Separator />

            {/* Prohibited Activities */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                6. Prohibited Activities
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You agree not to engage in any of the following prohibited activities:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Creating fake accounts or listings</li>
                <li>Impersonating other users or entities</li>
                <li>Harvesting user data or personal information</li>
                <li>Sending spam, unsolicited messages, or promotional content</li>
                <li>Attempting to manipulate ratings or reviews</li>
                <li>Circumventing security measures or access controls</li>
                <li>Using automated systems (bots, scrapers) without permission</li>
                <li>Posting malicious content, viruses, or harmful code</li>
                <li>Engaging in price manipulation or bid rigging</li>
                <li>Facilitating illegal transactions or activities</li>
              </ul>
            </section>

            <Separator />

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                7. Intellectual Property
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The PetMarket name, logo, website design, and all content created by us are 
                protected by intellectual property laws. You may not use, copy, or distribute 
                our materials without prior written consent.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                By posting content on PetMarket (including listings, photos, and descriptions), 
                you grant us a non-exclusive, worldwide, royalty-free license to use, display, 
                and distribute that content in connection with our Services. You retain ownership 
                of your content and can delete it at any time.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                If you believe your intellectual property rights have been infringed, please 
                contact us with details of the alleged infringement.
              </p>
            </section>

            <Separator />

            {/* Termination of Accounts */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                8. Termination of Accounts
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We reserve the right to suspend or terminate your account at our discretion, 
                including but not limited to the following circumstances:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Violation of these Terms of Service</li>
                <li>Fraudulent or illegal activity</li>
                <li>Repeated complaints from other users</li>
                <li>Posting prohibited content</li>
                <li>Extended period of inactivity</li>
                <li>Failure to pay applicable fees (when implemented)</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You may also terminate your account at any time through your account settings. 
                Upon termination, your right to use the Services will immediately cease, and 
                any content you have posted may be removed.
              </p>
            </section>

            <Separator />

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                9. Limitation of Liability
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                PetMarket provides a platform for connecting users but is not a party to 
                transactions between buyers and sellers. To the maximum extent permitted by law:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>We are not responsible for the quality, safety, or legality of animals listed</li>
                <li>We do not guarantee the accuracy of user-provided information</li>
                <li>We are not liable for any disputes between users</li>
                <li>We do not verify the credentials or backgrounds of users</li>
                <li>We are not responsible for any losses resulting from transactions</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Our Services are provided "as is" without warranties of any kind. In no event 
                shall PetMarket be liable for any indirect, incidental, special, consequential, 
                or punitive damages arising from your use of the Services.
              </p>
            </section>

            <Separator />

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                10. Governing Law
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                These Terms shall be governed by and construed in accordance with the laws of 
                the jurisdiction in which PetMarket operates, without regard to its conflict 
                of law provisions.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Any disputes arising from these Terms or your use of the Services shall be 
                resolved through binding arbitration in accordance with applicable arbitration 
                rules, except where prohibited by law. You agree to waive any right to participate 
                in class action lawsuits or class-wide arbitration.
              </p>
            </section>

            <Separator />

            {/* Changes to the Terms */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                11. Changes to the Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may modify these Terms at any time at our sole discretion. When we make 
                changes, we will update the "Last updated" date at the top of this page and, 
                for significant changes, we may provide additional notice such as:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Email notification to registered users</li>
                <li>Prominent notice on our website</li>
                <li>In-app notifications</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Your continued use of the Services after any modifications indicates your 
                acceptance of the updated Terms. If you do not agree with the changes, you 
                should discontinue using the Services and may request account deletion.
              </p>
            </section>

            {/* Contact */}
            <Separator />
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Contact Information
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">
                  Email: legal@petmarket.com<br />
                  Address: 123 Pet Street, Animal City, AC 12345<br />
                  Phone: +1 (555) 123-4567
                </p>
              </div>
            </section>
          </CardContent>
        </Card>

        {/* Footer links */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            See also:{' '}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
