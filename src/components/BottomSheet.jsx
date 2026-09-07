import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

export default function BottomSheet({ open, onClose, children, className = "" }) {
  const content = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className={`overlay open ${className}`}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className={`sheet open ${className}`}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="handle" />
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}
