      -- ============================================================
      -- 008_career_features.sql
      -- Career Compass: job_roles, career_goals, roadmaps, courses
      -- Idempotent — safe to run repeatedly in the Supabase SQL editor.
      -- ============================================================

      -- ------------------------------------------------------------
      -- job_roles — public reference catalog of target roles.
      -- Market fields (required_skills, salary_range, demand_level,
      -- entry_difficulty) are AI-filled on first analysis.
      -- ------------------------------------------------------------
      CREATE TABLE IF NOT EXISTS public.job_roles (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL UNIQUE,
        description TEXT,
        required_skills JSONB,
        salary_range TEXT,
        demand_level TEXT CHECK (demand_level IN ('low','medium','high')),
        entry_difficulty TEXT CHECK (entry_difficulty IN ('entry','intermediate','advanced')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE public.job_roles ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Authenticated users can view job_roles" ON public.job_roles;
      CREATE POLICY "Authenticated users can view job_roles"
        ON public.job_roles FOR SELECT USING (auth.role() = 'authenticated');

      CREATE INDEX IF NOT EXISTS idx_job_roles_title ON public.job_roles(title);

      -- ------------------------------------------------------------
      -- career_goals — per-user target role + latest gap analysis.
      -- ------------------------------------------------------------
      CREATE TABLE IF NOT EXISTS public.career_goals (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        role_title TEXT NOT NULL,
        desired_role_id UUID REFERENCES public.job_roles(id) ON DELETE SET NULL,
        gap_analysis JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (user_id, role_title)
      );

      ALTER TABLE public.career_goals ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Users can view their own career goals" ON public.career_goals;
      CREATE POLICY "Users can view their own career goals"
        ON public.career_goals FOR SELECT USING (auth.uid() = user_id);
      DROP POLICY IF EXISTS "Users can insert their own career goals" ON public.career_goals;
      CREATE POLICY "Users can insert their own career goals"
        ON public.career_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
      DROP POLICY IF EXISTS "Users can update their own career goals" ON public.career_goals;
      CREATE POLICY "Users can update their own career goals"
        ON public.career_goals FOR UPDATE USING (auth.uid() = user_id);
      DROP POLICY IF EXISTS "Users can delete their own career goals" ON public.career_goals;
      CREATE POLICY "Users can delete their own career goals"
        ON public.career_goals FOR DELETE USING (auth.uid() = user_id);

      CREATE INDEX IF NOT EXISTS idx_career_goals_user_id ON public.career_goals(user_id);

      -- ------------------------------------------------------------
      -- roadmaps — per-user phased career plan.
      -- ------------------------------------------------------------
      CREATE TABLE IF NOT EXISTS public.roadmaps (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        role_title TEXT NOT NULL,
        desired_role_id UUID REFERENCES public.job_roles(id) ON DELETE SET NULL,
        phases JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (user_id, role_title)
      );

      ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Users can view their own roadmaps" ON public.roadmaps;
      CREATE POLICY "Users can view their own roadmaps"
        ON public.roadmaps FOR SELECT USING (auth.uid() = user_id);
      DROP POLICY IF EXISTS "Users can insert their own roadmaps" ON public.roadmaps;
      CREATE POLICY "Users can insert their own roadmaps"
        ON public.roadmaps FOR INSERT WITH CHECK (auth.uid() = user_id);
      DROP POLICY IF EXISTS "Users can update their own roadmaps" ON public.roadmaps;
      CREATE POLICY "Users can update their own roadmaps"
        ON public.roadmaps FOR UPDATE USING (auth.uid() = user_id);
      DROP POLICY IF EXISTS "Users can delete their own roadmaps" ON public.roadmaps;
      CREATE POLICY "Users can delete their own roadmaps"
        ON public.roadmaps FOR DELETE USING (auth.uid() = user_id);

      CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON public.roadmaps(user_id);

      -- ------------------------------------------------------------
      -- courses — public reference catalog (fully curated, no AI).
      -- ------------------------------------------------------------
      CREATE TABLE IF NOT EXISTS public.courses (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL UNIQUE,
        platform TEXT,
        url TEXT,
        cost TEXT,
        skills JSONB,
        level TEXT CHECK (level IN ('beginner','intermediate','advanced')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Authenticated users can view courses" ON public.courses;
      CREATE POLICY "Authenticated users can view courses"
        ON public.courses FOR SELECT USING (auth.role() = 'authenticated');

      CREATE INDEX IF NOT EXISTS idx_courses_title ON public.courses(title);

      -- ------------------------------------------------------------
      -- updated_at trigger (idempotent)
      -- ------------------------------------------------------------
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_career_goals_updated_at ON public.career_goals;
      CREATE TRIGGER update_career_goals_updated_at BEFORE UPDATE ON public.career_goals
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_roadmaps_updated_at ON public.roadmaps;
      CREATE TRIGGER update_roadmaps_updated_at BEFORE UPDATE ON public.roadmaps
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      -- ------------------------------------------------------------
      -- Seed: 36 job roles (title + description; market fields AI-filled)
      -- ------------------------------------------------------------
      INSERT INTO public.job_roles (title, description) VALUES
        ('Software Engineer', 'Designs, builds, and maintains software applications across the stack.'),
        ('Frontend Developer', 'Builds user interfaces and experiences with HTML, CSS, and JavaScript.'),
        ('Backend Developer', 'Builds server-side logic, APIs, and databases powering applications.'),
        ('Full-Stack Developer', 'Works across both frontend and backend of web applications.'),
        ('Mobile Developer', 'Builds native or cross-platform mobile applications for iOS and Android.'),
        ('Web Developer', 'Creates and maintains websites, from layout to functionality.'),
        ('DevOps Engineer', 'Automates deployment, infrastructure, and CI/CD pipelines.'),
        ('Cloud Engineer', 'Designs and manages cloud infrastructure and services.'),
        ('Systems Administrator', 'Manages and maintains server infrastructure and uptime.'),
        ('Network Engineer', 'Designs, configures, and maintains computer networks.'),
        ('Cybersecurity Analyst', 'Protects systems and data from security threats and breaches.'),
        ('Data Analyst', 'Analyzes data to produce insights and support business decisions.'),
        ('Data Scientist', 'Applies statistics and machine learning to extract insights from data.'),
        ('Data Engineer', 'Builds pipelines and infrastructure for data collection and processing.'),
        ('Machine Learning Engineer', 'Builds and deploys machine learning models in production.'),
        ('AI Engineer', 'Develops AI systems including LLM applications and agents.'),
        ('Database Administrator', 'Manages database systems, performance, and security.'),
        ('QA Engineer', 'Designs and runs tests to ensure software quality and reliability.'),
        ('Product Manager', 'Owns product vision, roadmap, and stakeholder alignment.'),
        ('Project Manager', 'Plans, executes, and closes projects on time and budget.'),
        ('Scrum Master', 'Facilitates Agile ceremonies and removes team blockers.'),
        ('Business Analyst', 'Bridges business needs and technical solutions.'),
        ('UX/UI Designer', 'Designs intuitive, accessible user experiences and interfaces.'),
        ('Product Designer', 'Designs products balancing user needs, business goals, and feasibility.'),
        ('Graphic Designer', 'Creates visual content for brands, media, and products.'),
        ('Technical Writer', 'Writes clear documentation, guides, and API references.'),
        ('Solutions Architect', 'Designs technical solutions and system architecture for clients.'),
        ('IT Support Specialist', 'Provides technical support and resolves user issues.'),
        ('Game Developer', 'Builds video games using game engines and programming.'),
        ('Embedded Systems Engineer', 'Develops software for embedded and hardware systems.'),
        ('Robotics Engineer', 'Designs and programs robotic systems and automation.'),
        ('Digital Marketing Specialist', 'Runs digital campaigns across SEO, social, and ads.'),
        ('Financial Analyst', 'Analyzes financial data to guide investment and business decisions.'),
        ('Sales Engineer', 'Sells technical products by demonstrating technical value.'),
        ('Customer Success Manager', 'Drives customer adoption, retention, and growth.'),
        ('Operations Manager', 'Oversees day-to-day operations and process efficiency.')
      ON CONFLICT (title) DO NOTHING;

      -- ------------------------------------------------------------
      -- Seed: 26 curated real courses (skill-aligned catalog)
      -- ------------------------------------------------------------
      INSERT INTO public.courses (title, platform, url, cost, skills, level) VALUES
        ('Responsive Web Design', 'freeCodeCamp', 'https://www.freecodecamp.org/learn/2022/responsive-web-design/', 'Free', '["HTML","CSS"]', 'beginner'),
        ('JavaScript Algorithms and Data Structures', 'freeCodeCamp', 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', 'Free', '["JavaScript","Algorithms","Data Structures"]', 'beginner'),
        ('The Complete React Developer', 'Udemy', 'https://www.udemy.com/course/the-complete-react-developer-course-with-redux-hooks-and-context/', '99', '["React","Redux","Hooks","Next.js"]', 'intermediate'),
        ('Node.js Masterclass', 'Udemy', 'https://www.udemy.com/course/nodejs-masterclass/', '89', '["Node.js","Express","REST APIs"]', 'intermediate'),
        ('The Complete SQL Bootcamp', 'Udemy', 'https://www.udemy.com/course/the-complete-sql-bootcamp-2022-learn-by-doing/', '99', '["SQL","PostgreSQL"]', 'beginner'),
        ('IBM Data Science Professional Certificate', 'Coursera', 'https://www.coursera.org/professional-certificates/ibm-data-science', 'Free to audit', '["Python","Statistics","Machine Learning","Data Visualization"]', 'beginner'),
        ('Google Data Analytics Certificate', 'Coursera', 'https://www.coursera.org/professional-certificates/google-data-analytics', '39/mo', '["SQL","Spreadsheets","Data Analysis"]', 'beginner'),
        ('Machine Learning Specialization', 'Coursera', 'https://www.coursera.org/specializations/machine-learning-introduction', '49/mo', '["Python","Machine Learning","TensorFlow"]', 'intermediate'),
        ('AWS Certified Solutions Architect', 'Udemy', 'https://www.udemy.com/course/aws-certified-solutions-architect-saa-c03/', '119', '["AWS","EC2","S3","Lambda","IAM"]', 'advanced'),
        ('Meta Front-End Developer Professional Certificate', 'Coursera', 'https://www.coursera.org/professional-certificates/meta-front-end-developer', '49/mo', '["React","HTML","CSS","JavaScript"]', 'beginner'),
        ('CS50x Introduction to Computer Science', 'edX', 'https://www.edx.org/learn/computer-science/harvard-university-cs50-s-introduction-to-computer-science', 'Free', '["C","Python","Algorithms"]', 'beginner'),
        ('Python for Everybody', 'Coursera', 'https://www.coursera.org/specializations/python', 'Free to audit', '["Python","Data Structures"]', 'beginner'),
        ('Docker and Kubernetes: The Complete Guide', 'Udemy', 'https://www.udemy.com/course/docker-kubernetes-the-practical-guide/', '99', '["Docker","Kubernetes","Containers"]', 'intermediate'),
        ('CompTIA Security+', 'Udemy', 'https://www.udemy.com/course/securityplus/', '89', '["Security","Network Security","Cryptography"]', 'beginner'),
        ('Google UX Design Professional Certificate', 'Coursera', 'https://www.coursera.org/professional-certificates/google-ux-design', '39/mo', '["UX Research","Wireframing","Figma","Prototyping"]', 'beginner'),
        ('The Complete Python Bootcamp', 'Udemy', 'https://www.udemy.com/course/complete-python-bootcamp/', '94', '["Python","OOP","Automation"]', 'beginner'),
        ('AWS DevOps Engineer Professional', 'Udemy', 'https://www.udemy.com/course/aws-certified-devops-engineer-professional/', '119', '["DevOps","CI/CD","AWS","Terraform"]', 'advanced'),
        ('Full Stack Open', 'University of Helsinki', 'https://fullstackopen.com/en/', 'Free', '["React","Node.js","REST APIs","GraphQL","MongoDB"]', 'intermediate'),
        ('The Complete JavaScript Course', 'Udemy', 'https://www.udemy.com/course/the-complete-javascript-course/', '94', '["JavaScript","OOP","ES6"]', 'beginner'),
        ('Meta Back-End Developer Professional Certificate', 'Coursera', 'https://www.coursera.org/professional-certificates/meta-back-end-developer', '49/mo', '["Python","Django","APIs","Databases"]', 'beginner'),
        ('Google Project Management Certificate', 'Coursera', 'https://www.coursera.org/professional-certificates/google-project-management', '39/mo', '["Project Management","Agile","Scrum"]', 'beginner'),
        ('IBM Cybersecurity Analyst Professional Certificate', 'Coursera', 'https://www.coursera.org/professional-certificates/ibm-cybersecurity-analyst', 'Free to audit', '["Security","Network Security","Incident Response"]', 'beginner'),
        ('Unreal Engine 5 C++ Developer', 'Udemy', 'https://www.udemy.com/course/unreal-engine-5-cpp-multiplayer-shooter/', '89', '["C++","Unreal Engine","Game Development"]', 'intermediate'),
        ('The Complete Networking Course', 'Udemy', 'https://www.udemy.com/course/ccna-complete/', '99', '["Networking","TCP/IP","Routing","Switching"]', 'intermediate'),
        ('Google IT Support Professional Certificate', 'Coursera', 'https://www.coursera.org/professional-certificates/google-it-support', '39/mo', '["IT Support","Troubleshooting","Linux","Networking"]', 'beginner'),
        ('Data Visualization with Tableau', 'Udemy', 'https://www.udemy.com/course/tableau10/', '99', '["Tableau","Data Visualization","Dashboards"]', 'intermediate')
      ON CONFLICT (title) DO NOTHING;
