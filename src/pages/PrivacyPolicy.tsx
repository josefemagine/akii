import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Separator } from "@/components/ui/separator";

const PrivacyPolicy = () => {
  return (
    <MainLayout>
      <div className="container py-12 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <Separator className="mb-8" />

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground mb-4">
              At Akii, we respect your privacy and are committed to protecting
              your personal data. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you use our
              website and AI agent platform (collectively, the "Service").
            </p>
            <p className="text-muted-foreground mb-4">
              By accessing or using the Service, you consent to the collection,
              use, and disclosure of your information in accordance with this
              Privacy Policy. If you do not agree with our policies and
              practices, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              2. Information We Collect
            </h2>
            <p className="text-muted-foreground mb-4">
              We collect several types of information from and about users of
              our Service, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>
                <strong>Personal Data:</strong> Name, email address, phone
                number, billing information, and other similar information you
                provide when you register for an account or subscribe to our
                Service.
              </li>
              <li>
                <strong>Usage Data:</strong> Information about how you access
                and use our Service, including your IP address, browser type,
                device information, pages visited, and time spent on those
                pages.
              </li>
              <li>
                <strong>Training Data:</strong> Content you upload to train your
                AI agents, which may include documents, conversations, and other
                materials.
              </li>
              <li>
                <strong>AI Interaction Data:</strong> Conversations and
                interactions between users and AI agents deployed through our
                platform.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-muted-foreground mb-4">
              We use the information we collect for various purposes, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>To provide, maintain, and improve our Service</li>
              <li>To process subscriptions and payments</li>
              <li>
                To train and optimize AI agents based on your uploaded data
              </li>
              <li>To monitor and analyze usage patterns and trends</li>
              <li>
                To communicate with you about updates, support, and marketing
              </li>
              <li>
                To detect, prevent, and address technical issues and security
                threats
              </li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
            <p className="text-muted-foreground mb-4">
              We implement appropriate technical and organizational measures to
              protect your personal data against unauthorized access,
              alteration, disclosure, or destruction. However, no method of
              transmission over the Internet or electronic storage is 100%
              secure, and we cannot guarantee absolute security.
            </p>
            <p className="text-muted-foreground mb-4">
              We maintain data processing agreements with all third-party
              service providers who may have access to your information and
              require them to protect your data in accordance with industry
              standards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
            <p className="text-muted-foreground mb-4">
              We retain your personal data only for as long as necessary to
              fulfill the purposes for which we collected it, including for the
              purposes of satisfying any legal, accounting, or reporting
              requirements.
            </p>
            <p className="text-muted-foreground mb-4">
              Training data used for AI agents will be retained as long as your
              account is active or as needed to provide you with our Service.
              Upon account termination, we will delete or anonymize your
              personal data within 90 days, unless retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              6. Your Data Protection Rights
            </h2>
            <p className="text-muted-foreground mb-4">
              Depending on your location, you may have certain rights regarding
              your personal data, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>The right to access your personal data</li>
              <li>The right to rectify inaccurate personal data</li>
              <li>The right to erasure ("right to be forgotten")</li>
              <li>The right to restrict processing of your personal data</li>
              <li>The right to data portability</li>
              <li>The right to object to processing of your personal data</li>
              <li>The right to withdraw consent</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              To exercise these rights, please contact us using the information
              provided in the "Contact Us" section below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              7. Cookies and Tracking Technologies
            </h2>
            <p className="text-muted-foreground mb-4">
              We use cookies and similar tracking technologies to track activity
              on our Service and hold certain information. Cookies are files
              with a small amount of data that may include an anonymous unique
              identifier.
            </p>
            <p className="text-muted-foreground mb-4">
              You can instruct your browser to refuse all cookies or to indicate
              when a cookie is being sent. However, if you do not accept
              cookies, you may not be able to use some portions of our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              8. Third-Party Services
            </h2>
            <p className="text-muted-foreground mb-4">
              Our Service may contain links to third-party websites or services
              that are not owned or controlled by Akii. We have no control over,
              and assume no responsibility for, the content, privacy policies,
              or practices of any third-party websites or services.
            </p>
            <p className="text-muted-foreground mb-4">
              We may use third-party service providers to facilitate our
              Service, provide the Service on our behalf, perform
              Service-related services, or assist us in analyzing how our
              Service is used. These third parties have access to your personal
              data only to perform these tasks on our behalf and are obligated
              not to disclose or use it for any other purpose.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              9. Children's Privacy
            </h2>
            <p className="text-muted-foreground mb-4">
              Our Service is not intended for use by children under the age of
              16 ("Children"). We do not knowingly collect personally
              identifiable information from Children. If you are a parent or
              guardian and you are aware that your Child has provided us with
              personal data, please contact us. If we become aware that we have
              collected personal data from Children without verification of
              parental consent, we take steps to remove that information from
              our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              10. Changes to This Privacy Policy
            </h2>
            <p className="text-muted-foreground mb-4">
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page
              and updating the "Last updated" date at the bottom of this page.
            </p>
            <p className="text-muted-foreground mb-4">
              You are advised to review this Privacy Policy periodically for any
              changes. Changes to this Privacy Policy are effective when they
              are posted on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about this Privacy Policy, please
              contact us at privacy@akii.ai.
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

export default PrivacyPolicy;
