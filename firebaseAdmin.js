const admin = require('firebase-admin');
const { getAuth, doc } = require('firebase-admin/auth');
const { generateRandomStrings } = require('./functionHelpers');
const { mailHelper } = require('./emailHelper');
const moment = require('moment');
import Stripe from 'stripe';
import { buffer } from 'micro';

export const config = {
  api: {
    bodyParser: false,
  },
};

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: 'service_account',
      project_id: 'yasalam-55cc7',
      private_key_id: '96390aff13039b927293d34d67aff21bd8a806b1',
      private_key:
        '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCoJPfZlAf3SnSm\nemBQoCt5Ix1S1qKEGQY8Nudm+h4eN/VN5nN2koQA5kmD9abTiIkzC0hyiAHyOUzp\nMW7aJsVyatUyGkJ55z75uyDnlO97HuzzwsjUhM77JTwreThWsqoJBDc+yQqH4f1y\nS8hwW8twFY4Ag/mYPKooyJlIB1Ptasz0ueYYySXdOsX8U0zYs58FLRED2V9w9WSn\nK3rguU0qheK88MwTAHxUE/BHxb6mUROR1a7N8KgWetCSUtG9vMG7woExdhcGAa9C\nI/pdw1NPVuGs4HtrDh2YeSzjMWbXjeZACRPWS09zCiJkDJem2hN8Vt9cwSVRTTJ+\nkz7YIGuRAgMBAAECggEAAI+DsWIlb82QJKSzgBTqj8ocpxiKPlS26VhO96Awe48Z\n/qtZg/XNYyRUnZNairEqwhqMCgjzQpxjxZf7iVZjQ25iB22W3EIyQTfBxfDSk4g1\nAn9dViAWpcsJu+gFo1Xtlb58ZEjLGjL8fIJbP7yvnNV3oWPeMCX0h+5jL60pz7vf\nQqOhvMB6aYv27u6BvOfMp1a682jdZb405HVKbRGnXaj7T2UklzhbLg+n7dzd03Fz\nHAWy5DbTAbfk9SUj57Ax5dEsD1YyDxG3QN0M7cj1N87XR+lzBt5adrjdhxKjAIoZ\n8oI33Fpg0EtxqPvcRLwnjifynACw5CTqiG5X64FpgQKBgQDXGYr4vDI4eK9R9FCD\nTE2oVcAUl3XLu3RVo8hOC5+rTsEht5fp2GtaGPW4yz2PElt8Vin4w1BkSJvZRnoC\nKXs3jiLKasBpjO4Ec4CH5iAIOSJbdPNKE14cNDhk98JwIZjfNTNTawc3wfFlWrAP\nFy+Co8/sh21ImdrH5h358tcZEQKBgQDIHcTU+3IRlypgC5OKTT1GHnpv/Uh/9BUe\nEg6b2tSYBnJzG3UlTqof9c4Taw+HZxOV6K1tko60luCrKgx39+uegFDWoOtLHANN\nQmrjI4cI32SbcM58TJratCgKd0bToTD5sZ+qELlOc7haluGyrklWzhEsuEL7zkob\nGwqUNaAqgQKBgQDDsVFmCpIGHoYioYu+aGUeiSU/lqxsthaY83EA0EJrsDK1Yjqr\nXWINjje/7+gJikIBVMLKt6ckFYr0mdHWtbaMTJwKXCTB4p2JHywId60czh4b5sKQ\n2h38uuWztlUHfwl9yQDxG6Zta90awO78S7PFvxMjtfIO4yrQQuNyyyQ2gQKBgQCO\ncrpZDX/+S4erhLIKob67OhjXvQkto9agaCQkB1qLuRMhIut5mgx54aRGqFAOh24m\nqNFDDS8uF7Rnwu/LOhxr4FUq4rN67L7g8SVa+EA4LaTVDTC+xFz6z4EtKgitvrE5\nHJpWGb9+u9sACSUx5uRnuRn6plNwIUEZGF+obp/LgQKBgDaVNbSYLqzVM3YU/f//\nWY49DHj8xy5zqLA2GAMqAfPktOcaq7ECdJCOsz10DMqSyc2iErDuUKke/zsLilj4\n9wPqPAREQZlPinggvyVnyjQ5H2RPI5qyAgDmKUsUaFyaAZ0V1qDYEnmHH9xP0vj4\nf4vpD7O2bd1hs8q6l0uFIWRt\n-----END PRIVATE KEY-----\n',
      client_email:
        'firebase-adminsdk-ft3w2@yasalam-55cc7.iam.gserviceaccount.com',
      client_id: '113563829203742302974',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url:
        'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-ft3w2%40yasalam-55cc7.iam.gserviceaccount.com',
    }),
  });
}

const db = admin.firestore();
const auth = admin.auth();

// admins

const createUserAdmin = async (req, res) => {
  try {
    const decodedToken = await getAuth().verifyIdToken(req.body.idToken);
    const user = await getAuth().getUser(decodedToken.uid);

    if (!user.customClaims.admin) {
      throw new Error('Unauthorize');
    }

    const userRecord = await getAuth().createUser({
      email: req.body.email,
      password: req.body.password,
      emailVerified: true,
      disabled: false,
    });

    await auth.setCustomUserClaims(userRecord.uid, {
      admin: true,
    });

    res.status(200).send(true);
  } catch (error) {
    res.status(400).send('ERROR');
  }
};
const changePasswordAdmin = async (req, res) => {
  try {
    const decodedToken = await getAuth().verifyIdToken(req.body.idToken);
    const user = await getAuth().getUser(decodedToken.uid);

    if (!user.customClaims.admin) {
      throw new Error('Unauthorize');
    }

    await getAuth().updateUser(user.uid, {
      password: req.body.password,
    });

    res.status(200).send(true);
  } catch (error) {
    res.status(400).send('ERROR');
  }
};

// managers
const getAllUsers = async (req, res) => {
  try {
    const decodedToken = await getAuth().verifyIdToken(req.body.idToken);
    const maxResults = 1000; // optional arg.

    const user = await getAuth().getUser(decodedToken.uid);

    if (!user.customClaims.admin) {
      throw new Error('Unauthorize');
    }

    const users = await auth.listUsers(maxResults);
    res.status(200).send(users);
  } catch (error) {
    console.log(error);
    res.status(400).send('ERROR');
  }
};
const createUser = async (req, res) => {
  try {
    const decodedToken = await getAuth().verifyIdToken(req.body.idToken);
    const user = await getAuth().getUser(decodedToken.uid);

    if (!user.customClaims.admin) {
      throw new Error('Unauthorize');
    }

    const userRecord = await getAuth().createUser({
      email: req.body.email,
      password: req.body.password,
      emailVerified: true,
      disabled: false,
    });

    await auth.setCustomUserClaims(userRecord.uid, {
      manager: true,
      outlet: req.body.outlet,
      outletName: req.body.outletName,
    });

    res.status(200).send(true);
  } catch (error) {
    res.status(400).send('ERROR');
  }
};
const deleteUser = async (req, res) => {
  try {
    const decodedToken = await getAuth().verifyIdToken(req.body.idToken);
    const user = await getAuth().getUser(decodedToken.uid);

    if (!user.customClaims.admin) {
      throw new Error('Unauthorize');
    }

    await getAuth().deleteUser(req.body.uid);

    res.status(200).send(true);
  } catch (error) {
    res.status(400).send('ERROR');
  }
};
const assignManager = async () => {
  try {
    const decodedToken = await getAuth().verifyIdToken(req.body.idToken);
    const currentUser = await getAuth().getUser(decodedToken.uid);

    if (!currentUser.customClaims.admin) {
      throw new Error('Unauthorize');
    }
    const user = await auth.getUserByEmail('goldgyms@gmail.com');

    await auth.setCustomUserClaims(user.uid, {
      manager: true,
      outlet: 'e2f7d5c0-87eb-11ec-b6f8-dbc87dcb7fcf',
      outletName: 'Gold Gyms',
    });
  } catch (error) {
    res.status(400).send('ERROR');
  }
};
const changePasswordAUser = async (req, res) => {
  try {
    const decodedToken = await getAuth().verifyIdToken(req.body.idToken);
    const user = await getAuth().getUser(decodedToken.uid);

    if (!user.customClaims.admin) {
      throw new Error('Unauthorize');
    }

    await getAuth().updateUser(req.body.uid, {
      password: req.body.password,
    });

    res.status(200).send(true);
  } catch (error) {
    console.log(error);
    res.status(400).send('ERROR');
  }
};

// members
const checkIfMemberExist = async (req, res) => {
  try {
    let count = 0;
    let query = db.collection('members').where('email', '==', req.params.email);
    const querySnapshot = await query.get();
    querySnapshot.forEach((doc) => {
      count++;
    });
    if (count > 0) return res.send(true);
    return res.send(false);
  } catch (error) {
    res.send(true);
  }
  res.send(true);
};
const addMember = async (req, res) => {
  try {
    const date = new Date();

    const {
      firstname,
      middlename,
      lastname,
      email,
      mobileNumber,
      birthdate,
      nationality,
      gender,
      employerDetails,
      frontimageID,
      backimageID,
      userType,
    } = req.body;

    const otp = generateRandomStrings(6, 'otp');

    const year = moment(date).format('YYYY');
    const month = moment(date).format('MM');
    const day = moment(date).format('DD');

    const issueDate = moment(date).format('YYYY-MM-DD');
    const expiryDate = moment(date).format('YYYY-MM-DD');

    //   const expiryDate = new Date(2022, 0, 3)
    // const currentDate = new Date()
    // console.log(currentDate > expiryDate)

    const name = firstname + ' ' + middlename + ' ' + lastname;

    const docRef = await db.collection('members').add({
      name,
      email,
      mobileNumber,
      birthdate: moment(birthdate).format('YYYY-MM-DD'),
      nationality,
      gender,
      employerDetails,
      frontimageID,
      backimageID,
      userType,
      otp,
      issueDate,
      expiryDate,
      favorites: [],
      children: [],
      isSecondaryActive: false,
      secondaryId: '',
      points: 0,
      savings: 0,
      isActivate: false,
      isPaid: false,
      notificationToken: '',
      createdAt: moment(date).unix(),
      year,
      month,
      day,
    });

    const link = `${req.headers.origin}/api/payment/${docRef.id}`;

    const message = `Hi ${name}! Thank you for availing Yasalam Membership.  You may continue to the payment of your membership in this link: ${link}`;
    const htmlMessage = `Dear  ${name}!
   <br /> <br />
   Your one click away!!!
   Your Yasalam Membership registration is complete.<br>
   Please click on the link below to proceed and make your membership payment.<br><br>

   <a href="${link}"> ${link}</a>

   <br><br>

   Feel free to contact our team if you need any help or support. <br/>
   support@yasalamae.ae.

   <br><br>

   Sincerely,
   <br>
   Yasalam Team`;

    const mailOptions = {
      from: 'confirmation@yasalamae.ae',
      to: req.body.email,
      subject: `Welcome to Yasalam ${userType} Membership - Account Activation`,
      text: message,
      html: htmlMessage,
    };
    mailHelper(mailOptions);

    return res.status(201).send(true);
  } catch (error) {
    console.log(error);
    return res.send('Error');
  }
};
const addSecondary = async (req, res) => {
  const date = new Date();

  try {
    const mainAccount = await db.collection('members').doc(req.body.id).get();
    if (!(mainAccount.data().otp === req.body.otp)) {
      return res.status(400).send('Error Wrong OTP');
    }
    if (!mainAccount.data().isPaid) {
      return res.status(400).send('Error Main Account not Paid');
    }
    const {
      firstname,
      middlename,
      lastname,
      email,
      mobileNumber,
      birthdate,
      nationality,
      gender,
      employerDetails,
      frontimageID,
      backimageID,
      userType,
      id,
    } = req.body;

    const otp = generateRandomStrings(6, 'otp');

    const year = moment(date).format('YYYY');
    const month = moment(date).format('MM');
    const day = moment(date).format('DD');

    //   const expiryDate = new Date(2022, 0, 3)
    // const currentDate = new Date()
    // console.log(currentDate > expiryDate)

    const name = firstname + ' ' + middlename + ' ' + lastname;

    const docRef = await db.collection('members').add({
      name,
      email,
      mobileNumber,
      birthdate: moment(birthdate).format('YYYY-MM-DD'),
      nationality,
      gender,
      employerDetails,
      frontimageID,
      backimageID,
      userType,
      otp,
      issueDate: mainAccount.data().issueDate,
      expiryDate: mainAccount.data().expiryDate,
      favorites: [],
      children: [],
      isSecondaryActive: false,
      points: 0,
      savings: 0,
      isActivate: false,
      isPaid: true,
      notificationToken: '',
      createdAt: moment(date).unix(),
      year,
      month,
      day,
      mainAccountId: id,
      mainAccountEmail: mainAccount.data().email,
      mainAccountOTP: mainAccount.data().otp,
    });

    const message = `Hi ${name}! <br />
      Welcome to YaSalam  <br /> <br />

      UAE’s leading lifestyle membership platform. <br/> <br/>

      Your YaSalam account OTP is ${otp}<br/>
      Please don’t share your one time password (OTP) with anyone.<br/> <br/>

      Get started and be “YaSalam” in 3 easy steps <br/><br/>
      1-	Download YaSalam App
      2-	Login by using your email and your OTP
      3-	Start Exploring and enjoy.

      <br/><br/>
      Please feel free to contact our support team if you need any help <br/>
       support@yasalamae.ae .

       <br/><br/><br/>
       Stay healthy and YaSalam

       <br/><br/>
      Sincerely,  <br/>
      YaSalam Team`;
    const htmlMessage = `Hi ${name}! <br />
      Welcome to YaSalam  <br /> <br />

      UAE’s leading lifestyle membership platform. <br/> <br/>

      Your YaSalam account OTP is ${otp}<br/>
      Please don’t share your one time password (OTP) with anyone.<br/> <br/>

      Get started and be “YaSalam” in 3 easy steps <br/><br/>
      1-	Download YaSalam App
      2-	Login by using your email and your OTP
      3-	Start Exploring and enjoy.

      <br/><br/>
      Please feel free to contact our support team if you need any help <br/>
       support@yasalamae.ae .

       <br/><br/><br/>
       Stay healthy and YaSalam

       <br/><br/>
      Sincerely,  <br/>
      YaSalam Team`;
    const mailOptions = {
      from: 'confirmation@yasalamae.ae',
      to: email,
      subject: `Welcome to Yasalam Family Membership - Account Activation`,
      text: message,
      html: htmlMessage,
    };
    mailHelper(mailOptions);

    await db
      .collection('members')
      .doc(id)
      .update({ isSecondaryActive: true, secondaryId: docRef.id });

    return res.status(201).send(true);
  } catch (error) {
    console.log(error);
    return res.send('Error');
  }
};
const resendPaymentEmail = async (req, res) => {
  try {
    let query = db.collection('members').where('email', '==', req.body.email);
    const querySnapshot = await query.get();
    const member = {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data(),
    };

    const link = `${req.headers.origin}/api/payment/${member.id}`;

    const message = `Hi ${member.name}! Thank you for availing Yasalam Membership.  You may continue to the payment of your membership in this link: ${link}`;
    const htmlMessage = `Dear  ${member.name}!
     <br /> <br />
     Your one click away!!!
     Your Yasalam Membership registration is complete.<br>
     Please click on the link below to proceed and make your membership payment.<br><br>

     <a href="${link}"> ${link}</a>

     <br><br>

     Feel free to contact our team if you need any help or support. <br/>
     support@yasalamae.ae.

     <br><br>

     Sincerely,
     <br>
     Yasalam Team`;

    const mailOptions = {
      from: 'confirmation@yasalamae.ae',
      to: req.body.email,
      subject: `Welcome to Yasalam ${member.userType} Membership - Account Activation`,
      text: message,
      html: htmlMessage,
    };
    mailHelper(mailOptions);

    return res.status(201).send(true);
  } catch (error) {
    return res.status(404).send(false);
  }
};

const getMember = async (id) => {
  try {
    let doc = await db.collection('members').doc(id).get();
    const member = doc.data();
    delete member.otp;
    console.log(doc.id);
    return { ...member, id: doc.id };
  } catch (error) {
    return null;
  }
};

const getMemberByEmail = async (email) => {
  try {
    let query = db.collection('members').where('email', '==', email);
    const querySnapshot = await query.get();
    const member = querySnapshot.docs[0].data();

    if (!member) {
      return null;
    }

    return member;
  } catch (error) {
    return null;
  }
};
const getMemberByEmailOTP = async (req, res) => {
  try {
    let query = db
      .collection('members')
      .where('email', '==', req.body.email)
      .where('otp', '==', req.body.otp);
    const querySnapshot = await query.get();
    const member = {
      ...querySnapshot.docs[0].data(),
      id: querySnapshot.docs[0].id,
    };

    res.send(member);
  } catch (error) {
    res.status(404).send('Error');
  }
};

const memberPaid = async (email, update) => {
  try {
    let query = db.collection('members').where('email', '==', email);
    const querySnapshot = await query.get();
    const member = querySnapshot.docs[0].data();

    await db.collection('members').doc(querySnapshot.docs[0].id).update(update);

    const message = `Hi ${member.name}! <br />
      Welcome to YaSalam  <br /> <br />

      UAE’s leading lifestyle membership platform. <br/> <br/>

      Your YaSalam account OTP is ${member.otp}<br/>
      Please don’t share your one time password (OTP) with anyone.<br/> <br/>

      Get started and be “YaSalam” in 3 easy steps <br/><br/>
      1-	Download YaSalam App
      2-	Login by using your email and your OTP
      3-	Start Exploring and enjoy.

      <br/><br/>
      Please feel free to contact our support team if you need any help <br/>
       support@yasalamae.ae .

       <br/><br/><br/>
       Stay healthy and YaSalam

       <br/><br/>
      Sincerely,  <br/>
      YaSalam Team`;
    const htmlMessage = `Hi ${member.name}! <br />
      Welcome to YaSalam  <br /> <br />

      UAE’s leading lifestyle membership platform. <br/> <br/>

      Your YaSalam account OTP is ${member.otp}<br/>
      Please don’t share your one time password (OTP) with anyone.<br/> <br/>

      Get started and be “YaSalam” in 3 easy steps <br/><br/>
      1-	Download YaSalam App
      2-	Login by using your email and your OTP
      3-	Start Exploring and enjoy.

      <br/><br/>
      Please feel free to contact our support team if you need any help <br/>
       support@yasalamae.ae .

       <br/><br/><br/>
       Stay healthy and YaSalam

       <br/><br/>
      Sincerely,  <br/>
      YaSalam Team`;
    const mailOptions = {
      from: 'confirmation@yasalamae.ae',
      to: email,
      subject: `Welcome to Yasalam ${member.userType} Membership - Account Activation`,
      text: message,
      html: htmlMessage,
    };
    mailHelper(mailOptions);

    return member;
  } catch (error) {
    console.log(error);
    return new Error('error updating user');
  }
};

const checkIfReferralExist = async (id) => {
  try {
    let doc = await db.collection('referrals').doc(id).get();
    if (doc.exists) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};
const deleteReferral = async (id) => {
  try {
    await db.collection('referrals').doc(id).delete();
  } catch (error) {
    return new Error('Error Deleting Referral');
  }
};

// transactions
const addRegisterTransaction = async (member) => {
  const date = new Date();
  const year = moment(date).format('YYYY');
  const month = moment(date).format('MM');
  const day = moment(date).format('DD');
  await db.collection('registerTransactions').add({
    name: member.name,
    userType: member.userType,
    amountPaid: member.amountPaid,
    createdAt: date,
    year,
    month,
    day,
  });
};

const checkEmailLogin = async (req, res) => {
  console.log('check');
  try {
    let query = db.collection('members').where('email', '==', req.body.email);
    const querySnapshot = await query.get();
    // check if email is existing
    if (!querySnapshot.docs[0]) {
      return res.status(404).send('Email not found');
    }
    const member = querySnapshot.docs[0].data();
    // check if member is paid
    if (!member.isPaid) {
      return res.status(400).send('Please pay your membership first');
    }

    // check if membership expired
    const expiryDate = moment(member.expiryDate);
    const now = moment();

    if (now > expiryDate) {
      return res.status(400).send('Your membership expired');
    }
    // check if member is activated
    if (member.isActivate) {
      return res
        .status(400)
        .send(
          'Your account is currently login to different device. Please Contact the YaSalam'
        );
    }
    res.status(200).send(true);
  } catch (error) {
    console.log('error', error);
    return res.status(500).send('Server error. please try again');
  }
};
const otpLogin = async (req, res) => {
  try {
    let query = db.collection('members').where('email', '==', req.body.email);
    const querySnapshot = await query.get();
    // check if email is existing
    if (!querySnapshot.docs[0]) {
      return res.status(404).send('Email not found');
    }
    const member = {
      ...querySnapshot.docs[0].data(),
      id: querySnapshot.docs[0].id,
    };

    if (!req.body.otp) {
      return res.status(400).send('OTP is required');
    }
    if (member.otp !== req.body.otp) {
      console.log('member', member.otp);
      console.log('otp', req.body.otp);
      return res.status(400).send('OTP do not match');
    } else {
      const member = await updateActivate(req.body.email);
      return res.status(200).send(member);
    }
  } catch (error) {
    console.log('error', error);
    return res.status(404).send('Server error. please try again');
  }
};
const updateActivate = async (email) => {
  try {
    let query = db.collection('members').where('email', '==', email);
    const querySnapshot = await query.get();
    const member = {
      ...querySnapshot.docs[0].data(),
      id: querySnapshot.docs[0].id,
    };
    if (!member) {
      return new Error('Server error');
    }
    const update = { isActivate: true };

    await db.collection('members').doc(querySnapshot.docs[0].id).update(update);

    return member;
  } catch (error) {
    return new Error('Server error');
  }
};
const buyWithPoints = async (req, res) => {
  try {
    let query = db
      .collection('members')
      .where('email', '==', req.body.email)
      .where('otp', '==', req.body.otp);
    let querySnapshot = await query.get();
    const member = {
      ...querySnapshot.docs[0].data(),
      id: querySnapshot.docs[0].id,
    };
    const product = await db.collection('products').doc(req.body.product).get();

    if (member.points < product.data().points) {
      return res.status(400).send('Points is insufficient');
    } else if (product.data().quantity < 1) {
      return res.status(400).send('Product is sold out');
    } else {
      await db
        .collection('products')
        .doc(req.body.product)
        .update({ quantity: product.data().quantity - 1 });

      await db
        .collection('members')
        .doc(member.id)
        .update({ points: member.points - product.data().points });

      await db.collection('vouchers').add({
        memberId: member.id,
        memberName: member.name,
        name: product.data().name,
        image: product.data().image,
        description: product.data().description,
        claimed: false,
        boughtAt: moment(new Date()).format('YYYY-MM-DD'),
        createdAt: new Date(),
        year: moment(new Date()).format('YYYY'),
        month: moment(new Date()).format('MM'),
        day: moment(new Date()).format('DD'),
      });
    }

    res.send('nice');
  } catch (error) {
    console.log(error);
    res.status(400).send('Error please Try again');
  }
};
const addChild = async (req, res) => {
  try {
    let query = db
      .collection('members')
      .where('email', '==', req.body.email)
      .where('otp', '==', req.body.otp);
    let querySnapshot = await query.get();
    const member = {
      ...querySnapshot.docs[0].data(),
      id: querySnapshot.docs[0].id,
    };
    if (member.children.length === 3) {
      return res.status(400).send('You can only add 3 children');
    }
    if (member.userType !== 'family') {
      return res
        .status(400)
        .send('Error only family account can have children');
    }
    const update = {
      children: [
        ...member.children,
        {
          name: req.body.name,
          gender: req.body.gender,
          age: req.body.age,
          birthdate: req.body.birthdate,
        },
      ],
    };

    await db.collection('members').doc(member.id).update(update);

    res.send('nice');
  } catch (error) {
    console.log(error);
    res.status(400).send('Server Error. Please try again');
  }
};
const addFavorite = async (req, res) => {
  try {
    let query = db
      .collection('members')
      .where('email', '==', req.body.email)
      .where('otp', '==', req.body.otp);
    let querySnapshot = await query.get();
    const member = {
      ...querySnapshot.docs[0].data(),
      id: querySnapshot.docs[0].id,
    };
    if (member.favorites.includes(req.body.outletId)) {
      return res.status(400).send('Outlet is already in favorites');
    }

    const update = {
      favorites: [...member.favorites, req.body.outletId],
    };

    await db.collection('members').doc(member.id).update(update);

    res.send('nice');
  } catch (error) {
    console.log(error);
    res.status(400).send('Server Error. Please try again');
  }
};
const deleteFavorite = async (req, res) => {
  try {
    let query = db
      .collection('members')
      .where('email', '==', req.body.email)
      .where('otp', '==', req.body.otp);
    let querySnapshot = await query.get();
    const member = {
      ...querySnapshot.docs[0].data(),
      id: querySnapshot.docs[0].id,
    };

    const newFav = member.favorites.filter((e) => e !== req.body.outletId);

    const update = {
      favorites: [...newFav],
    };

    await db.collection('members').doc(member.id).update(update);

    res.send('nice');
  } catch (error) {
    console.log(error);
    res.status(400).send('Server Error. Please try again');
  }
};
const updateWithReferral = async (req, res) => {
  const date = new Date();
  console.log(req.body.code);
  try {
    const isReferral = await checkIfReferralExist(req.body.code);

    if (!isReferral) {
      console.log(isReferral);
      return res.status(400).send('Invalid referral');
    }
    const member = await getMemberByEmail(req.body.email);
    if (!member) {
      return res.status(400).send('User not found');
    }

    if (member.isPaid) {
      return res.status(400).send('User already paid');
    }

    const issueDate = moment(date).format('YYYY-MM-DD');
    const expiryDate = moment(date).add(1, 'years').format('YYYY-MM-DD');

    await memberPaid(member.email, {
      isPaid: true,
      issueDate: issueDate,
      expiryDate: expiryDate,
    });

    await deleteReferral(req.body.code);

    return res.status(200).send('Activated');
  } catch (error) {
    console.log(error);
    return res.status(400).send('Error Please Try Again');
  }
};
const getMemberInfo = async (req, res) => {
  try {
    const member = await getMember(req.params.id);
    if (!member) return res.status(404).send('User not found');
    return res.send({
      name: member.name,
      email: member.email,
      id: member.id,
      points: member.points,
      savings: member.savings,
    });
  } catch (error) {
    return res.status(404).send('User not found');
  }
};

const updateMember = async (req, res) => {
  const date = new Date();
  const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY);
  if (req.method === 'POST') {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];
    const webhookSecret =
      process.env.NODE_ENV == 'development'
        ? process.env.STRIPE_WEBHOOK_SIGNING_SECRET_LOCAL
        : process.env.STRIPE_WEBHOOK_SIGNING_SECRET_PROD;

    let event;

    try {
      if (!sig || !webhookSecret) return;

      // payment_intent.succeeded
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
      if (event.type === 'payment_intent.succeeded') {
        const customer = await stripe.customers.retrieve(
          event.data.object.customer
        );

        const issueDate = moment(date).format('YYYY-MM-DD');
        const expiryDate = moment(date).add(1, 'years').format('YYYY-MM-DD');

        const member = await memberPaid(customer.email, {
          isPaid: true,
          issueDate: issueDate,
          expiryDate: expiryDate,
        });
        await addRegisterTransaction({
          ...member,
          amountPaid: event.data.object.amount_received / 100,
        });
      }
      return res.status(200).send();
    } catch (error) {
      console.log('Webhook Error: ' + error.message);
      return res.status(400).send('Webhook Error: ' + error.message);
    }
  }
  res.status(200).send();
};

module.exports = {
  db,
  auth,
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
  updateMember,
};
