var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');
var User = require('../models/User');
var auth = require('../middlewares/auth');
var Income = require('../models/Income');
var Expense = require('../models/Expense');
var moment = require('moment');
const mongoose = require('mongoose');




router.get('/login', async (req,res,next)=> {
  try {
    res.render('loginPage')
  } catch (error) {
    next(error)
  }
});

router.post('/login', async (req,res,next)=> {
  var {email,password} = req.body;
  try {
    if(!email || !password){
      res.redirect('/users/login');
    }
    var user = await User.findOne({email});
    if(!user){
      res.redirect('/users/login');
    }
    const isVerified = await user.isVerified(password);
    if(!isVerified){
      res.redirect('/users/login');
    }
    req.session.userId = user.id;
    res.redirect('/users');
  } catch (error) {
    next(error);
  }
});

router.get('/signup', async (req,res,next)=> {
  try {
    res.render('RegisterPage');
  } catch (error) {
    next(error)
  }
});
router.post('/signup', async (req,res,next)=> {
  try {
    console.log(req.method,req.body,req.files);
    var userData = {
      email : req.body.email,
      providers :['local'],
      local : {
        name : req.body.name,
        password : req.body.password,
        age : req.body.age,
        phone : req.body.phone,
        address :{
          city : req.body.city,
          state : req.body.state,
          country : req.body.country,
          pincode : req.body.pincode
        }
      }
    }
    var user = await User.create(userData);
    res.redirect('/users/login');
  } catch (error) {
    next(error);
  }
});


router.use(auth.isUserLogged);

router.get('/onboarding', async (req,res,next)=> {
  try {
    console.log(req.user,"hey",req.session,res.locals.user);
    res.render('onboarding');
  } catch (error) {
    next(error);
  }
});

router.use(auth.isUserLogged);

router.get('/', async (req,res,next)=> {
  console.log(req.user.id);
  const id1 = req.user.id;
  var id = mongoose.Types.ObjectId(req.user.id);
  var pathName = req.path;

  try {
    let currentMonth = moment().month();
    let currentYear = moment().year();
    console.log(moment().format('YYYY-MM-DD'));
    console.log(currentMonth.currentYear);
    let incomeOfCurrentMonth = await Income.aggregate([
      {$match : {"userId" : id}},
      {$project : {
        "source" : "$source",
        "description" : {
          "name" : "$description.name",
          "amount" : "$description.amount",
          "date" : "$description.date" 
        },
        "userId": "$userId",
        "entryType" : "$entryType",
        "createdAt" : "$createdAt",
        "updatedAt" : "$updatedAt",
        "month" : {$month : "$description.date"},
        "year" : {$year : "$description.date"}
      }},
      {$match : {"month" : currentMonth+1}},
      {$match : {"year" : currentYear}}
    ]);
    let expensesOfCurrentMonth = await Expense.aggregate([
      {$match : {"userId" : id}},
      {$project : {
        "category" : "$category",
        "description" : {
          "name" : "$description.name",
          "info" : "$description.info",
          "amount" : "$description.amount",
          "date" : "$description.date" 
        },
        "userId": "$userId",
        "entryType" : "$entryType",
        "createdAt" : "$createdAt",
        "updatedAt" : "$updatedAt",
        "month" : {$month : "$description.date"},
        "year" : {$year : "$description.date"}
      }},
      {$match : {"month" : currentMonth+1}},
      {$match : {"year" : currentYear}}
    ]);
    var uniqueExpenseCategoryArray = [];
    var expenseCatArray = await Expense.find({"userId": id, "entryType": "expense"}, "category");
    expenseCatArray.forEach(cat => {
      if(!uniqueExpenseCategoryArray.includes(cat.category)){
        uniqueExpenseCategoryArray.push(cat.category);
      }
    });
    var uniqueIncomeCategoryArray= [];
    var incomeCatArray = await Income.find({"userId": id, "entryType": "income"}, "source");
    incomeCatArray.forEach(cat => {
      if(!uniqueIncomeCategoryArray.includes(cat.source)){
        uniqueIncomeCategoryArray.push(cat.source);
      }
    });
    console.log(incomeOfCurrentMonth,"bv",expensesOfCurrentMonth, "Here");
    let monthlyPortfolio = [...incomeOfCurrentMonth,...expensesOfCurrentMonth];
    console.log(monthlyPortfolio, );
    let data = monthlyPortfolio.sort((a,b)=> {
      return b.description.date - a.description.date
    });
    console.log(data);
    res.render('userDashboard',{data,moment,pathName,uniqueExpenseCategoryArray,uniqueIncomeCategoryArray});
  } catch (error) {
    next(error);
  }
});

router.post('/filter/bydate', async (req,res,next)=> {
  var id = mongoose.Types.ObjectId(req.user.id);
  console.log(req.path);  
  var pathName = req.path;
  try {
    var {startDate,endDate} = req.body
    console.log(req.body);
    var incomeArray = await Income.find({"userId": id, "description.date" : {$gte : startDate, $lte: endDate}});
    var expenseArray = await Expense.find({"userId": id, "description.date" : {$gte : startDate, $lte: endDate}});
    
    var data = [...incomeArray,...expenseArray];
    data = data.sort((a,b)=> {
      return b.description.date - a.description.date
    });
    console.log(data);
    var uniqueExpenseCategoryArray = [];
    var expenseCatArray = await Expense.find({"userId": id, "entryType": "expense"}, "category");
    expenseCatArray.forEach(cat => {
      if(!uniqueExpenseCategoryArray.includes(cat.category)){
        uniqueExpenseCategoryArray.push(cat.category);
      }
    });
    var uniqueIncomeCategoryArray = [];
    var incomeCatArray = await Income.find({"userId": id, "entryType": "income"}, "source");
    incomeCatArray.forEach(cat => {
      if(!uniqueIncomeCategoryArray.includes(cat.source)){
        uniqueIncomeCategoryArray.push(cat.source);
      }
    });
    res.render('userDashboard',{data,moment,pathName,startDate,endDate,uniqueExpenseCategoryArray,uniqueIncomeCategoryArray});
  } catch (error) {
    next(error);
  }
});

router.post('/incomecategory/',auth.isUserLogged, async (req,res,next)=> {
  console.log("hey",req.body.category);
  var cat = req.params.id
  var id = mongoose.Types.ObjectId(req.user.id);
  var pathName = req.path;
  var thirtyDaysPrior = moment().subtract(30, 'days');
  try {
    var category = req.body.category;
    var uniqueIncomeCategoryArray = [];
    var incomeCatArray = await Income.find({"userId": id, "entryType": "income"}, "source");
    incomeCatArray.forEach(cat => {
      if(!uniqueIncomeCategoryArray.includes(cat.source)){
        uniqueIncomeCategoryArray.push(cat.source);
      }
    });
    var uniqueExpenseCategoryArray = [];
    var expenseCatArray = await Expense.find({"userId": id, "entryType": "expense"}, "category");
    expenseCatArray.forEach(cat => {
      if(!uniqueExpenseCategoryArray.includes(cat.category)){
        uniqueExpenseCategoryArray.push(cat.category);
      }
    });
    
    if(category === "All"){
      var data = await Income.find({"userId": id, "entryType": "income","description.date" :{$gte : moment(thirtyDaysPrior).format(), $lte: moment().format()}});

    }else{
      var data = await Income.find({"userId": id, "entryType": "income", "source": req.body.category,"description.date" :{$gte : moment(thirtyDaysPrior).format(), $lte: moment().format()}});

    }
    data = data.sort((a,b)=> {
      return b.description.date - a.description.date
    });
    console.log("data:",data, ".......", moment(thirtyDaysPrior).format());
    res.render('userDashboard', {moment,pathName,uniqueIncomeCategoryArray,data,category,pathName,thirtyDaysPrior,uniqueExpenseCategoryArray})
  } catch (error) {
    next(error);
  }
});

router.post('/expensecategory/',auth.isUserLogged, async (req,res,next)=> {
  var id = mongoose.Types.ObjectId(req.user.id);
  var pathName = req.path;
  var thirtyDaysPrior = moment().subtract(30, 'days');
  console.log(thirtyDaysPrior,"are BC",pathName);
  try {
    var category = req.body.category;
    var uniqueExpenseCategoryArray = [];
    var expenseCatArray = await Expense.find({"userId": id, "entryType": "expense"}, "category");
    expenseCatArray.forEach(cat => {
      if(!uniqueExpenseCategoryArray.includes(cat.category)){
        uniqueExpenseCategoryArray.push(cat.category);
      }
    });
    var uniqueIncomeCategoryArray = []; 
    var incomeCatArray = await Income.find({"userId": id, "entryType": "income"}, "source");
    incomeCatArray.forEach(cat => {
      if(!uniqueIncomeCategoryArray.includes(cat.source)){
        uniqueIncomeCategoryArray.push(cat.source);
      }
    });
    if(category === "All"){
      var data = await Expense.find({"userId": id, "entryType": "expense",
      "description.date" :{$gte : moment(thirtyDaysPrior).format(), $lte: moment().format()}});
    }else {
      var data = await Expense.find({"userId": id, "entryType": "expense", "category": req.body.category,
      "description.date" :{$gte : moment(thirtyDaysPrior).format(), $lte: moment().format()}});

    }
    data = data.sort((a,b)=> {
      return b.description.date - a.description.date
    });
    res.render('userDashboard', {moment,pathName,category,uniqueExpenseCategoryArray,data,pathName,thirtyDaysPrior,uniqueIncomeCategoryArray});
  } catch (error) {
    next(error);
  }
})

router.post('/filterExpenseAndDate/',auth.isUserLogged, async (req,res,next)=> {
  var id = mongoose.Types.ObjectId(req.user.id);
  var pathName = req.path;
  console.log(pathName);
  try {
    var {startDate,endDate} = req.body;
    var category = req.body.category;
    var uniqueExpenseCategoryArray = [];
    var expenseCatArray = await Expense.find({"userId": id, "entryType": "expense"}, "category");
    expenseCatArray.forEach(cat => {
      if(!uniqueExpenseCategoryArray.includes(cat.category)){
        uniqueExpenseCategoryArray.push(cat.category);
      }
    });
    var uniqueIncomeCategoryArray = []; 
    var incomeCatArray = await Income.find({"userId": id, "entryType": "income"}, "source");
    incomeCatArray.forEach(cat => {
      if(!uniqueIncomeCategoryArray.includes(cat.source)){
        uniqueIncomeCategoryArray.push(cat.source);
      }
    });
    if(category === "All"){
      var data = await Expense.find({"userId": id, "description.date" : {$gte : startDate, $lte: endDate}});      
    } else {
      var data = await Expense.find({"userId": id, "description.date" : {$gte : startDate, $lte: endDate}, "source" : req.body.category});

    }
    console.log(data);
    data = data.sort((a,b)=> {
      return b.description.date - a.description.date
    });
    res.render('userDashboard', {moment,pathName,uniqueExpenseCategoryArray,data,pathName,uniqueIncomeCategoryArray,startDate,endDate,category})
  } catch (error) {
    next(error);
  }
});

router.post('/filterIncomeAndDate/',auth.isUserLogged, async (req,res,next)=> {
  var id = mongoose.Types.ObjectId(req.user.id);
  console.log(req.body);
  var pathName = req.path;
  console.log(pathName);
  try {
    var {startDate,endDate} = req.body;
    var category = req.body.category;
    var uniqueExpenseCategoryArray = [];
    var expenseCatArray = await Expense.find({"userId": id, "entryType": "expense"}, "category");
    expenseCatArray.forEach(cat => {
      if(!uniqueExpenseCategoryArray.includes(cat.category)){
        uniqueExpenseCategoryArray.push(cat.category);
      }
    });
    var uniqueIncomeCategoryArray = []; 
    var incomeCatArray = await Income.find({"userId": id, "entryType": "income"}, "source");
    incomeCatArray.forEach(cat => {
      if(!uniqueIncomeCategoryArray.includes(cat.source)){
        uniqueIncomeCategoryArray.push(cat.source);
      }
    });
    if(category === "All"){
      var data = await Income.find({"userId": id, "description.date" : {$gte : startDate, $lte: endDate}});
    } else {
      var data = await Income.find({"userId": id, "description.date" : {$gte : startDate, $lte: endDate}, "source" : req.body.category});

    }
    console.log(uniqueIncomeCategoryArray);
    data = data.sort((a,b)=> {
      return b.description.date - a.description.date
    });
    res.render('userDashboard', {moment,pathName,uniqueExpenseCategoryArray,data,uniqueIncomeCategoryArray,startDate,endDate,category})
  } catch (error) {
    next(error);
  }
});






router.get('/logout', async (req,res,next)=> {
  try {
    req.session.destroy();
    res.clearCookie('connect.sid');
    res.redirect('/');
  } catch (error) {
    return next(error);
  }
})

router.get('/addincome', async (req,res,next)=> {
  try {
    res.render('addincome',{multer});
  } catch (error) {
    next(error);
  }
})

router.post('/addincome', async (req,res,next)=> {
  try {
    var incomeData = {
      source : req.body.source,
      description : {
        name : req.body.name,
        amount : req.body.amount,
        date : req.body.date || Date()
      },
      userId : req.user.id,
    }
    const addedIncome = await Income.create(incomeData);
    res.redirect('/users');
  } catch (error) {
    next(error);
  }
})

router.get('/addexpense', async (req,res,next)=> {
  try {
    res.render('addexpense',{multer});
  } catch (error) {
    next(error);
  }
})

router.post('/addexpense', async (req,res,next)=> {
  try {
    console.log(req.body);
    var expenseData = {
      category : req.body.category,
      description : {
        name : req.body.name,
        amount : req.body.amount,
        info : req.body.info,
        date : req.body.date || Date()
      }, 
      userId : req.user.id,
    }
    const addedExpense = await Expense.create(expenseData);
    res.redirect('/users');
  } catch (error) {
    next(error);
  }
})






module.exports = router;
