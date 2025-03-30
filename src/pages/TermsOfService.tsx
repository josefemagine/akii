import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Separator } from "@/components/ui/separator";

const TermsOfService = () => {
  return (
    <MainLayout>
      <div className="container py-12 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
        <Separator className="mb-8" />

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground mb-4">
              Welcome to Akii ("Company", "we", "our", "us"). These Terms of
              Service ("Terms", "Terms of Service") govern your use of our
              website and AI agent platform (collectively, the "Service")
              operated by Akii.
            </p>
            <p className="text-muted-foreground mb-4">
              By accessing or using the Service, you agree to be bound by these
              Terms. If you disagree with any part of the terms, you may not
              access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Accounts</h2>
            <p className="text-muted-foreground mb-4">
              When you create an account with us, you must provide information
              that is accurate, complete, and current at all times. Failure to
              do so constitutes a breach of the Terms, which may result in
              immediate termination of your account on our Service.
            </p>
            <p className="text-muted-foreground mb-4">
              You are responsible for safeguarding the password that you use to
              access the Service and for any activities or actions under your
              password, whether your password is with our Service or a
              third-party service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              3. Subscription Terms
            </h2>
            <p className="text-muted-foreground mb-4">
              Some parts of the Service are billed on a subscription basis
              ("Subscription(s)"). You will be billed in advance on a recurring
              and periodic basis ("Billing Cycle"). Billing cycles are set on a
              monthly or annual basis, depending on the type of subscription
              plan you select when purchasing a Subscription.
            </p>
            <p className="text-muted-foreground mb-4">
              At the end of each Billing Cycle, your Subscription will
              automatically renew under the exact same conditions unless you
              cancel it or Akii cancels it. You may cancel your Subscription
              renewal either through your online account management page or by
              contacting Akii customer support team.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. AI Agent Usage</h2>
            <p className="text-muted-foreground mb-4">
              Our Service provides AI agents that can be trained on your data
              and deployed across various platforms. You retain all rights to
              your data, but grant us a license to use this data to provide and
              improve the Service.
            </p>
            <p className="text-muted-foreground mb-4">
              You are responsible for ensuring that any data you upload for
              training your AI agents complies with all applicable laws and does
              not infringe on any third-party rights. You must not use our AI
              agents for any illegal or unauthorized purpose.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              5. Content Moderation
            </h2>
            <p className="text-muted-foreground mb-4">
              We employ content moderation systems to prevent misuse of our
              Service. You agree not to use the Service to generate or
              distribute content that is illegal, harmful, threatening, abusive,
              harassing, tortious, defamatory, vulgar, obscene, invasive of
              another's privacy, or otherwise objectionable.
            </p>
            <p className="text-muted-foreground mb-4">
              We reserve the right to review and moderate any content generated
              through our Service and to take appropriate action, including
              removing content or suspending accounts, if we determine, in our
              sole discretion, that such content violates these Terms or
              applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              6. Intellectual Property
            </h2>
            <p className="text-muted-foreground mb-4">
              The Service and its original content, features, and functionality
              are and will remain the exclusive property of Akii and its
              licensors. The Service is protected by copyright, trademark, and
              other laws of both the United States and foreign countries. Our
              trademarks and trade dress may not be used in connection with any
              product or service without the prior written consent of Akii.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              7. Limitation of Liability
            </h2>
            <p className="text-muted-foreground mb-4">
              In no event shall Akii, nor its directors, employees, partners,
              agents, suppliers, or affiliates, be liable for any indirect,
              incidental, special, consequential or punitive damages, including
              without limitation, loss of profits, data, use, goodwill, or other
              intangible losses, resulting from (i) your access to or use of or
              inability to access or use the Service; (ii) any conduct or
              content of any third party on the Service; (iii) any content
              obtained from the Service; and (iv) unauthorized access, use or
              alteration of your transmissions or content, whether based on
              warranty, contract, tort (including negligence) or any other legal
              theory, whether or not we have been informed of the possibility of
              such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Changes</h2>
            <p className="text-muted-foreground mb-4">
              We reserve the right, at our sole discretion, to modify or replace
              these Terms at any time. If a revision is material we will try to
              provide at least 30 days' notice prior to any new terms taking
              effect. What constitutes a material change will be determined at
              our sole discretion.
            </p>
            <p className="text-muted-foreground mb-4">
              By continuing to access or use our Service after those revisions
              become effective, you agree to be bound by the revised terms. If
              you do not agree to the new terms, please stop using the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about these Terms, please contact us at
              support@akii.ai.
            </p>
          </section>
        </div>

        <div className="mt-12 text-sm text-muted-foreground">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default TermsOfService;
