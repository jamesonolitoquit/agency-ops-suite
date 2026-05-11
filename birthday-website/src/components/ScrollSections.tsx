'use client'

import { motion } from 'framer-motion'

export default function ScrollSections() {
  return (
    <>
      {/* Skills */}
      <section id="skills" className="py-20 px-4 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-3xl font-bold text-center mb-6 text-[var(--text-primary)]"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Skills
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border border-[var(--text-muted)] rounded text-[var(--text-primary)]">React</div>
            <div className="text-center p-4 border border-[var(--text-muted)] rounded text-[var(--text-primary)]">Next.js</div>
            <div className="text-center p-4 border border-[var(--text-muted)] rounded text-[var(--text-primary)]">TypeScript</div>
            <div className="text-center p-4 border border-[var(--text-muted)] rounded text-[var(--text-primary)]">Tailwind</div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="py-32 px-4 bg-[var(--bg-primary)]">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-3xl font-bold text-center mb-12 text-[var(--text-primary)]"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Projects
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 border border-[var(--text-muted)] rounded bg-[var(--bg-secondary)]">
              <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)]">Project 1</h3>
              <p className="text-[var(--text-secondary)]">Description of project 1.</p>
            </div>
            <div className="p-6 border border-[var(--text-muted)] rounded bg-[var(--bg-secondary)]">
              <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)]">Project 2</h3>
              <p className="text-[var(--text-secondary)]">Description of project 2.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 px-4 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2
            className="text-3xl font-bold mb-8 text-[var(--text-primary)]"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            About Me
          </motion.h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            Passionate developer with experience in web technologies.
          </p>
        </div>
      </section>
    </>
  )
}