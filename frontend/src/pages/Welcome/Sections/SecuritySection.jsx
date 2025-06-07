import { CheckCircle } from "@/components/Icons/Icons";
const SecuritySection = () => {
  return (
    <div className="mb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Built on Trust & Security
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your mental health data deserves the highest level of protection.
            Our blockchain-based audit trails ensure complete transparency and
            immutable records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Blockchain Audit Trails
                  </h3>
                  <p className="text-gray-600">
                    Every session and consent record is cryptographically
                    secured and timestamped on the blockchain.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Encrypted Data Storage
                  </h3>
                  <p className="text-gray-600">
                    All personal data is encrypted and stored securely, with
                    only hashes stored on-chain.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Dynamic Consent Management
                  </h3>
                  <p className="text-gray-600">
                    Patients maintain full control over their data with
                    blockchain-verified consent records.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">256-bit</div>
                  <div className="text-blue-100">Encryption</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">100%</div>
                  <div className="text-blue-100">Immutable</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">24/7</div>
                  <div className="text-blue-100">Monitoring</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">HIPAA</div>
                  <div className="text-blue-100">Compliant</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;
