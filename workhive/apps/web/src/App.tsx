import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import CreatorDashboard from './pages/creator/Dashboard';
import PostJob from './pages/creator/PostJob';
import MyJobs from './pages/creator/MyJobs';
import JobDetail from './pages/creator/JobDetail';
import Proposals from './pages/creator/Proposals';
import FundEscrow from './pages/creator/FundEscrow';
import ReleasePayment from './pages/creator/ReleasePayment';
import Payments from './pages/creator/Payments';
import WorkerDashboard from './pages/worker/Dashboard';
import BrowseJobs from './pages/worker/BrowseJobs';
import SendPitch from './pages/worker/SendPitch';
import MyProposals from './pages/worker/MyProposals';
import MyContracts from './pages/worker/MyContracts';
import SubmitDelivery from './pages/worker/SubmitDelivery';
import Earnings from './pages/worker/Earnings';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/creator" element={<CreatorDashboard />} />
      <Route path="/creator/post-job" element={<PostJob />} />
      <Route path="/creator/my-jobs" element={<MyJobs />} />
      <Route path="/creator/jobs/:id" element={<JobDetail />} />
      <Route path="/creator/jobs/:id/proposals" element={<Proposals />} />
      <Route path="/creator/jobs/:id/fund-escrow" element={<FundEscrow />} />
      <Route path="/creator/jobs/:id/release-payment" element={<ReleasePayment />} />
      <Route path="/creator/payments" element={<Payments />} />
      <Route path="/worker" element={<WorkerDashboard />} />
      <Route path="/worker/browse-jobs" element={<BrowseJobs />} />
      <Route path="/worker/jobs/:id/pitch" element={<SendPitch />} />
      <Route path="/worker/my-proposals" element={<MyProposals />} />
      <Route path="/worker/my-contracts" element={<MyContracts />} />
      <Route path="/worker/contracts/:id/submit" element={<SubmitDelivery />} />
      <Route path="/worker/earnings" element={<Earnings />} />
    </Routes>
  );
}
