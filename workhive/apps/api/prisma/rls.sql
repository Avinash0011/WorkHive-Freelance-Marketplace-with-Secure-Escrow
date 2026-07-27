-- PostgreSQL Row-Level Security Policies for WorkHive
-- Enable RLS on all tables

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Users can read their own data
CREATE POLICY users_select_own ON users
  FOR SELECT
  USING (id = app.current_user_id());

-- Users can update their own data (except role and wallet_balance)
CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (id = app.current_user_id())
  WITH CHECK (
    id = app.current_user_id() AND
    role = (SELECT role FROM users WHERE id = app.current_user_id()) AND
    wallet_balance_paise = (SELECT wallet_balance_paise FROM users WHERE id = app.current_user_id())
  );

-- Jobs table policies
-- Clients can read their own jobs
CREATE POLICY jobs_select_own ON jobs
  FOR SELECT
  USING (client_id = app.current_user_id());

-- Freelancers can read posted jobs
CREATE POLICY jobs_select_posted ON jobs
  FOR SELECT
  USING (status = 'posted');

-- Freelancers can read jobs they're assigned to
CREATE POLICY jobs_select_assigned ON jobs
  FOR SELECT
  USING (freelancer_id = app.current_user_id());

-- Clients can create jobs
CREATE POLICY jobs_insert_own ON jobs
  FOR INSERT
  WITH CHECK (client_id = app.current_user_id());

-- Clients can update their own jobs (only if status is draft or posted)
CREATE POLICY jobs_update_own ON jobs
  FOR UPDATE
  USING (client_id = app.current_user_id() AND status IN ('draft', 'posted'))
  WITH CHECK (client_id = app.current_user_id() AND status IN ('draft', 'posted'));

-- Clients can delete their own jobs (only if status is draft or posted)
CREATE POLICY jobs_delete_own ON jobs
  FOR DELETE
  USING (client_id = app.current_user_id() AND status IN ('draft', 'posted'));

-- Proposals table policies
-- Freelancers can read their own proposals
CREATE POLICY proposals_select_own ON proposals
  FOR SELECT
  USING (freelancer_id = app.current_user_id());

-- Clients can read proposals for their jobs
CREATE POLICY proposals_select_job_owner ON proposals
  FOR SELECT
  USING (job_id IN (SELECT id FROM jobs WHERE client_id = app.current_user_id()));

-- Freelancers can create proposals
CREATE POLICY proposals_insert_own ON proposals
  FOR INSERT
  WITH CHECK (freelancer_id = app.current_user_id());

-- Freelancers can withdraw their own pending proposals
CREATE POLICY proposals_withdraw_own ON proposals
  FOR UPDATE
  USING (freelancer_id = app.current_user_id() AND status = 'pending')
  WITH CHECK (freelancer_id = app.current_user_id() AND status = 'withdrawn');

-- Payments table policies
-- Users can read their own payments
CREATE POLICY payments_select_own ON payments
  FOR SELECT
  USING (owner_id = app.current_user_id());

-- Reviews table policies
-- Users can read reviews for jobs they're involved in
CREATE POLICY reviews_select_involved ON reviews
  FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM jobs 
      WHERE client_id = app.current_user_id() OR freelancer_id = app.current_user_id()
    )
  );

-- Users can read reviews they received
CREATE POLICY reviews_select_received ON reviews
  FOR SELECT
  USING (reviewee_id = app.current_user_id());

-- Users can create reviews for jobs they're involved in
CREATE POLICY reviews_insert_involved ON reviews
  FOR INSERT
  WITH CHECK (
    reviewer_id = app.current_user_id() AND
    job_id IN (
      SELECT id FROM jobs 
      WHERE client_id = app.current_user_id() OR freelancer_id = app.current_user_id()
    )
  );

-- Audit logs policies
-- Users can read their own audit logs
CREATE POLICY audit_logs_select_own ON audit_logs
  FOR SELECT
  USING (actor_id = app.current_user_id());

-- Function to set current user context
CREATE OR REPLACE FUNCTION app.set_current_user_id(user_id text)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user_id', user_id, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user ID
CREATE OR REPLACE FUNCTION app.current_user_id()
RETURNS text AS $$
BEGIN
  RETURN current_setting('app.current_user_id', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
