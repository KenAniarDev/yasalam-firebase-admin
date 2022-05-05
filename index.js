require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const {
  createUserAdmin,
  changePasswordAdmin,
  getAllUsers,
  createUser,
  deleteUser,
  assignManager,
  changePasswordAUser,
  checkIfMemberExist,
  addMember,
  addSecondary,
  resendPaymentEmail,
  getMember,
  getMemberByEmail,
  getMemberByEmailOTP,
  memberPaid,
  checkIfReferralExist,
  deleteReferral,
  addRegisterTransaction,
  checkEmailLogin,
  otpLogin,
  updateActivate,
  buyWithPoints,
  addChild,
  addFavorite,
  deleteFavorite,
  updateWithReferral,
  getMemberInfo,
  deleteMember,
  claimVoucher,
  unclaimVoucher,
  resendPaymentEmailById,
  resetMember,
} = require('./firebaseAdmin');
const port = process.env.PORT || 8000;

// middlewares
app.use(express.json());

app.use(
  cors({
    origin: [
      'https://yasalam.vercel.app',
      'https://yasalamae.vercel.app',
      'http://localhost:3000',
      'https://yasalamae-dg5gy.ondigitalocean.app',
      'https://yasalamae.ae',
      'https://www.yasalamae.ae',
      'https://royalmembership.ae',
      'https://www.royalmembership.ae',
    ],
  })
);
app.options(cors());

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  next();
});
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// routes
// ===========================================================================
//
// ===========================================================================
app.route('/test').get((req, res) => res.send('test update na may 5 6:52pm'));
// ===========================================================================
// ADMIN
// ===========================================================================
app.route('/api/admin/create').post((req, res) => createUserAdmin(req, res));
app
  .route('/api/admin/change-password')
  .post((req, res) => changePasswordAdmin(req, res));

// ===========================================================================
// MANAGER
// ===========================================================================
app.route('/api/manager').post((req, res) => getAllUsers(req, res));
app.route('/api/manager/create').post((req, res) => createUser(req, res));
app.route('/api/manager/delete').post((req, res) => deleteUser(req, res));
app
  .route('/api/manager/change-password')
  .post((req, res) => changePasswordAUser(req, res));
app
  .route('/api/manager/assign-outlet')
  .post((req, res) => assignManager(req, res));
// ===========================================================================
// MEMBER
// ===========================================================================
app.route('/api/member/:email').get((req, res) => checkIfMemberExist(req, res));
app.route('/api/member/create').post((req, res) => addMember(req, res));
app.route('/api/member/delete').post((req, res) => deleteMember(req, res));
app
  .route('/api/member/create-secondary')
  .post((req, res) => addSecondary(req, res));
app
  .route('/api/member/resend-payment-link')
  .post((req, res) => resendPaymentEmail(req, res));
app
  .route('/api/member/resend-payment-link-id')
  .post((req, res) => resendPaymentEmailById(req, res));
app
  .route('/api/member/get-by-email-otp')
  .post((req, res) => getMemberByEmailOTP(req, res));
app
  .route('/api/member/check-email-login')
  .post((req, res) => checkEmailLogin(req, res));
app.route('/api/member/otp-login').post((req, res) => otpLogin(req, res));
app.route('/api/member/reset').post((req, res) => resetMember(req, res));
app
  .route('/api/member/buy-with-points')
  .post((req, res) => buyWithPoints(req, res));
app.route('/api/member/add-child').post((req, res) => addChild(req, res));
app.route('/api/member/add-favorite').post((req, res) => addFavorite(req, res));
app
  .route('/api/member/delete-favorite')
  .post((req, res) => deleteFavorite(req, res));
app
  .route('/api/member/activate-with-referral')
  .post((req, res) => updateWithReferral(req, res));
app
  .route('/api/member/get-info/:id')
  .get((req, res) => getMemberInfo(req, res));
// ===========================================================================
// Vouchers
// ===========================================================================
app.route('/api/vouchers/claim').post((req, res) => claimVoucher(req, res));
app.route('/api/vouchers/unclaim').post((req, res) => unclaimVoucher(req, res));
// ===========================================================================
// TRANSACTIONS
// ===========================================================================

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

app.all('*', (req, res, next) => {
  next(new Error(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send('Server Error');
});
