import { motion } from 'framer-motion';

export function ProjectCardSkeleton() {
  return (
    <div className="glass-panel rounded-xl p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-5 bg-white/10 rounded w-3/4 mb-2" />
          <div className="h-4 bg-white/5 rounded w-full" />
        </div>
        <div className="w-8 h-8 bg-white/10 rounded-lg" />
      </div>
      <div className="h-4 bg-white/5 rounded w-1/2" />
    </div>
  );
}

export function StepSkeleton() {
  return (
    <div className="glass-panel rounded-xl p-5 mb-6 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-white/10 rounded-full" />
        <div className="h-4 bg-white/10 rounded w-32" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-white/5 rounded w-full" />
        <div className="h-4 bg-white/5 rounded w-5/6" />
        <div className="h-4 bg-white/5 rounded w-4/6" />
      </div>
    </div>
  );
}

export function NodeSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-xl p-6 animate-pulse"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-white/10 rounded-lg" />
        <div className="h-5 bg-white/10 rounded w-48" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-white/5 rounded w-full" />
        <div className="h-4 bg-white/5 rounded w-5/6" />
      </div>
      <div className="h-10 bg-white/10 rounded-lg" />
    </motion.div>
  );
}

