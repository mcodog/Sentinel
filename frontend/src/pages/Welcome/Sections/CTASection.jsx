import HeroButtonLink from "@/components/buttons/WhiteButtonLink";

const CTASection = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-white mb-4">
          Ready to Transform Mental Healthcare?
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Join thousands of patients and healthcare providers who trust Sentinel
          for secure, AI-powered mental health support.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <HeroButtonLink to="/register" variant="solid">
            Start Your Journey Today
          </HeroButtonLink>
          <HeroButtonLink to="/login" variant="outline">
            Already Have an Account?
          </HeroButtonLink>
        </div>
      </div>
    </div>
  );
};

export default CTASection;
