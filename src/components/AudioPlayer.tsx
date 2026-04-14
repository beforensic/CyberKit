import { ArrowLeft, Headphones } from 'lucide-react';

interface AudioPlayerProps {
  url: string;
  title: string;
  onClose: () => void;
}

export default function AudioPlayer({ url, title, onClose }: AudioPlayerProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#1B3A5C' }}>
      <button
        onClick={onClose}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all backdrop-blur-sm"
      >
        <ArrowLeft className="w-5 h-5" />
        Retour aux ressources
      </button>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">SecuriCoach</h1>
          <div className="w-24 h-1 bg-white/30 mx-auto"></div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Headphones className="w-16 h-16 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white text-center mb-8 px-4">
            {title}
          </h2>

          <audio
            controls
            autoPlay
            className="w-full"
            style={{
              filter: 'brightness(0.9)',
            }}
          >
            <source src={url} type="audio/mpeg" />
            <source src={url} type="audio/mp4" />
            <source src={url} type="audio/x-m4a" />
            Votre navigateur ne supporte pas la lecture audio.
          </audio>
        </div>

        <div className="mt-12 flex items-center justify-center gap-8 opacity-70">
          <div className="w-16 h-1 bg-white/30 rounded"></div>
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <div className="w-16 h-1 bg-white/30 rounded"></div>
        </div>
      </div>
    </div>
  );
}
