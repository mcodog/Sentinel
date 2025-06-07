import {
  MessageCircle,
  Mic,
  Shield,
  Brain,
  Users,
  FileText,
} from "@/components/Icons";

const features = [
  {
    icon: <MessageCircle />,
    title: "AI-Powered Conversations",
    description:
      "Engage with our intelligent assistant through voice or chat for personalized mental health support",
  },
  {
    icon: <Mic />,
    title: "Voice & Text Sessions",
    description:
      "Choose your preferred communication method with real-time speech-to-text and text-to-speech capabilities",
  },
  {
    icon: <Brain />,
    title: "Sentiment Analysis",
    description:
      "Advanced AI analyzes emotional patterns and provides insights to healthcare providers",
  },
  {
    icon: <Shield />,
    title: "Blockchain Security",
    description:
      "Immutable audit trails and secure consent management using blockchain technology",
  },
  {
    icon: <FileText />,
    title: "Session Transcripts",
    description:
      "Comprehensive session logs with sentiment highlighting and AI-generated summaries",
  },
  {
    icon: <Users />,
    title: "Doctor Dashboard",
    description:
      "Healthcare providers can monitor patient progress and access detailed analytics",
  },
];

const AppFeatures = () => {
  <div className="bg-gray-50 py-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Comprehensive Mental Health Platform
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Our platform combines cutting-edge AI technology with blockchain
          security to provide a complete mental health support ecosystem.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="mb-6">{feature.icon}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {feature.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>;
};

export default AppFeatures;
