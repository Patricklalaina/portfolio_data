import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowUpRight, CheckCircle2, Link as LinkIcon } from "lucide-react";
import { ResolvedIcon } from "@/lib/icon-utils";
import { useGetProfile, useSendContactMessage } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_CONTACT_MESSAGE =
  "I'm currently open to new opportunities. Whether you have a question, a project proposal, or just want to say hi, I'll try my best to get back to you!";

export function Contact() {
  const { data: profile, isLoading } = useGetProfile();
  const mutation = useSendContactMessage();
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ data: { name: formData.name, email: formData.email, message: formData.message } });
  };

  const contactMethods = Array.isArray(profile?.contactInfo) ? profile.contactInfo : [];
  const socialLinks = Array.isArray(profile?.socialLinks) ? profile.socialLinks : [];

  return (
    <section id="contact" className="py-24 relative bg-card/10 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Left Column */}
          <div>
            <div className="mb-10">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Get in touch</h2>
              <p className="text-muted-foreground font-mono text-sm">/ Let's build something together</p>
            </div>
            
            <p className="text-muted-foreground mb-12 max-w-md leading-relaxed">
              {isLoading ? <Skeleton className="h-16 w-full" /> : (profile?.contactMessage || DEFAULT_CONTACT_MESSAGE)}
            </p>

            <div className="flex flex-col gap-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border border-border bg-card/30">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-8 h-8 rounded-sm" />
                      <div>
                        <Skeleton className="h-3 w-16 mb-2" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  </div>
                ))
              ) : contactMethods.length === 0 ? (
                <p className="text-sm text-muted-foreground font-mono">No contact info added yet.</p>
              ) : (
                contactMethods.map((method) => {
                  const Wrapper = method.url ? "a" : "div";
                  return (
                    <Wrapper
                      key={method.id}
                      {...(method.url ? { href: method.url } : {})}
                      className="flex items-center justify-between p-4 border border-border bg-card/30 hover:border-primary/50 hover:bg-card/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 border border-border bg-background group-hover:border-primary/30 transition-colors">
                          <ResolvedIcon iconKey={method.iconKey} fallback={Mail} className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <p className="text-xs font-mono text-muted-foreground mb-1">{method.label}</p>
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{method.value}</p>
                        </div>
                      </div>
                      {method.url && <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />}
                    </Wrapper>
                  );
                })
              )}
            </div>

            {/* Social links — managed separately from Contact Info above */}
            {!isLoading && socialLinks.length > 0 && (
              <div className="flex items-center gap-4 mt-8 pt-8 border-t border-border">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Connect</span>
                <div className="flex items-center gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={social.platform}
                      className="p-2 border border-border bg-card/30 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                    >
                      <ResolvedIcon iconKey={social.iconKey} fallback={LinkIcon} className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Form) */}
          <div className="relative">
            {mutation.isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full border border-border bg-card/30 p-8 flex flex-col items-center justify-center text-center min-h-[400px]"
              >
                <div className="w-16 h-16 border-2 border-primary/20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Message Sent</h3>
                <p className="text-muted-foreground mb-8 max-w-xs">
                  Thank you for reaching out. I'll get back to you as soon as possible.
                </p>
                <button 
                  onClick={() => { mutation.reset(); setFormData({ name: "", email: "", message: "" }); }}
                  className="text-xs font-mono text-primary hover:text-primary/80 underline decoration-primary/30 underline-offset-4"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="border border-border bg-card/30 p-8 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Name</label>
                  <input 
                    id="name"
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors text-foreground"
                    placeholder="Jane Doe"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Email</label>
                  <input 
                    id="email"
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors text-foreground"
                    placeholder="jane@example.com"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Message</label>
                  <textarea 
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none text-foreground"
                    placeholder="How can I help you?"
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={mutation.isPending}
                  className="mt-2 bg-primary text-primary-foreground font-medium py-3 px-4 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border border-transparent"
                >
                  {mutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></span>
                      Sending...
                    </span>
                  ) : (
                    "Send Message"
                  )}
                </button>
                {mutation.isError && (
                  <p className="text-destructive text-sm text-center mt-2">Failed to send message. Please try again.</p>
                )}
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
