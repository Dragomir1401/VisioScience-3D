import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaMedal } from "react-icons/fa";

interface Badge {
  id: string;
  title: string;
  description: string;
  icon?: string;
  earnedAt?: string;
}

interface BadgeNotificationProps {
  badges: Badge[];
  onClose: () => void;
}

const BadgeNotification: React.FC<BadgeNotificationProps> = ({
  badges,
  onClose,
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-md border-l-4 border-yellow-400">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FaMedal className="h-8 w-8 text-yellow-400" />
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {badges.length === 1
                  ? "New Badge Earned!"
                  : "New Badges Earned!"}
              </p>
              <div className="mt-2 space-y-2">
                {badges.map((badge) => (
                  <div key={badge.id} className="flex items-center space-x-2">
                    {badge.icon && (
                      <img src={badge.icon} alt="" className="h-6 w-6" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {badge.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={onClose}
                className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BadgeNotification;
