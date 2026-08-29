import { Link } from "react-router-dom";
import { Scale, BadgeCheck, QrCode, ShieldCheck, ArrowRight } from "lucide-react";
import { ROUTES } from "../../config/routes";
import { appConfig } from "../../config/appConfig";
import Button from "../../components/common/Button";

function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-slate-900 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="inline-block px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-medium">
            Smart India Hackathon 2026
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            Digital Legal Metrology<br />
            <span className="text-blue-400">Verification Platform</span>
          </h1>
          <p className="text-slate-400 text-base max-w-2xl mx-auto leading-relaxed">
            Streamlining the verification of weighing and measuring instruments for businesses, Legal Metrology Officers, and Government Approved Test Centres — with transparency, traceability, and blockchain-backed certificate authenticity.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight size={16} />}
            >
              <Link to={ROUTES.REGISTER}>Register as Business</Link>
            </Button>
            <Link
              to={ROUTES.VERIFY}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              Verify a Certificate
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-10">
          Platform Capabilities
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center">
                <f.icon size={20} className="text-blue-700" />
              </div>
              <h3 className="font-semibold text-slate-800 text-sm">{f.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-700 py-12 px-6 text-center text-white">
        <h2 className="text-2xl font-bold mb-3">Verify a Certificate</h2>
        <p className="text-blue-200 text-sm mb-6 max-w-md mx-auto">
          Scan a QR code or enter a certificate ID to instantly verify the authenticity of any verified instrument certificate.
        </p>
        <Link
          to={ROUTES.VERIFY}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-blue-700 rounded-md font-semibold text-sm hover:bg-blue-50 transition-colors"
        >
          <QrCode size={16} /> Verify Now
        </Link>
      </section>
    </div>
  );
}

const features = [
  {
    icon: Scale,
    title: "Instrument Registration",
    description: "Register weighing and measuring instruments and track their entire verification lifecycle.",
  },
  {
    icon: BadgeCheck,
    title: "Digital Certificates",
    description: "Receive tamper-proof digital verification certificates with QR codes for instant verification.",
  },
  {
    icon: QrCode,
    title: "QR Verification",
    description: "Scan QR codes to instantly verify the authenticity and validity of any certificate.",
  },
  {
    icon: ShieldCheck,
    title: "Blockchain Security",
    description: "Certificate hashes anchored on blockchain for immutable, transparent record keeping.",
  },
];

export default Home;
