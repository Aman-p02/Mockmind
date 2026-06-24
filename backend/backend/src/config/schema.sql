-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for user profiles (extends Supabase Auth users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    college TEXT,
    degree TEXT,
    branch TEXT,
    placement_type TEXT CHECK (placement_type IN ('On-Campus', 'Off-Campus')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for Aptitude Results
CREATE TABLE aptitude_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    topic TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    score INTEGER NOT NULL,
    accuracy FLOAT,
    topic_mastery TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for DSA Results
CREATE TABLE dsa_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    topic TEXT NOT NULL,
    difficulty TEXT,
    score INTEGER NOT NULL,
    correctness_score INTEGER,
    logic_score INTEGER,
    complexity_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for Computer Science Fundamentals
CREATE TABLE fundamentals_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL, -- e.g., OOP, DBMS, OS, CN, SQL
    score INTEGER NOT NULL,
    readiness_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for Resume Analysis
CREATE TABLE resume_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    resume_url TEXT, -- Path in Supabase Storage
    ats_score INTEGER,
    resume_quality_score INTEGER,
    missing_skills JSONB,
    missing_keywords JSONB,
    suggestions TEXT,
    parsed_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for Interviews
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('Technical', 'HR', 'Off-Campus')),
    domain TEXT, -- for Off-Campus
    score INTEGER,
    technical_accuracy_score INTEGER,
    problem_solving_score INTEGER,
    concept_clarity_score INTEGER, -- for Technical
    communication_score INTEGER,
    confidence_score INTEGER,
    professionalism_score INTEGER, -- for HR
    feedback TEXT,
    transcript JSONB, -- Logs of questions and answers
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for Progress Tracking
CREATE TABLE progress_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    readiness_score INTEGER,
    aptitude_avg INTEGER,
    dsa_avg INTEGER,
    fundamentals_avg INTEGER,
    resume_score INTEGER,
    technical_avg INTEGER,
    hr_avg INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS POLICIES

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE aptitude_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsa_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE fundamentals_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Results: Users can only see/add their own results
CREATE POLICY "Users can view their own aptitude results" ON aptitude_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own aptitude results" ON aptitude_results FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own dsa results" ON dsa_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own dsa results" ON dsa_results FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own fundamentals results" ON fundamentals_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own fundamentals results" ON fundamentals_results FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own resume analysis" ON resume_analysis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own resume analysis" ON resume_analysis FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own interviews" ON interviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own interviews" ON interviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own progress" ON progress_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert/update their own progress" ON progress_tracking FOR ALL USING (auth.uid() = user_id);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_progress_tracking_updated_at BEFORE UPDATE ON progress_tracking FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
