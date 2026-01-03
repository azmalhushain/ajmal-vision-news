import { EmailTemplateBuilder } from "@/components/admin/EmailTemplateBuilder";
import { motion } from "framer-motion";

const EmailTemplateBuilderPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <EmailTemplateBuilder />
    </motion.div>
  );
};

export default EmailTemplateBuilderPage;
