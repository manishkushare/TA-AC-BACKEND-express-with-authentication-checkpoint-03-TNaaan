const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname,'..','public','uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
})

const upload = multer({ storage: storage })


var expenseData = {
      source : req.body.category,
      description : {
        name : req.body.name,
        amount : req.body.amount,
        info : req.body.info
      },
      userId : req.user.id,
    }


// let expenseArray = await Expense.aggregate([
    //   {$match : {"userId" : id}},
    //   {$project : {
    //     "category" : "$category",
    //     "description" : {
    //       "name" : "$description.name",
    //       "info" : "$description.info",
    //       "amount" : "$description.amount",
    //       "date" : "$description.date" 
    //     },
    //     "userId": "$userId",
    //     "entryType" : "$entryType",
    //     "createdAt" : "$createdAt",
    //     "updatedAt" : "$updatedAt",
    //   }},
    //   {$match : moment("date").isBetween(startDate,endDate)}
    // ]);

     // let incomeArray = await Income.aggregate([
    //   {$match : {"userId" : id}},
    //   {$project : {
    //     "source" : "$source",
    //     "description" : {
    //       "name" : "$description.name",
    //       "amount" : "$description.amount",
    //       "date" : "$description.date" 
    //     },
    //     "userId": "$userId",
    //     "entryType" : "$entryType",
    //     "createdAt" : "$createdAt",
    //     "updatedAt" : "$updatedAt",
    //   }
    //   },
      
    // ]);


//====================\

users/incomecategory?category
=======================//

router.post('/incomecategory/',auth.isUserLogged, async (req,res,next)=> {
  var cat = req.params.id
  var categoryReq = req.body.category;
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
    var data = await Income.find({"userId": id, "entryType": "income", "source": req.body.category,"date" :{$gte : moment(thirtyDaysPrior).format(), $lte: moment().format()}});
    console.log("data:",data, ".......", moment(thirtyDaysPrior).format());
    res.render('userDashboard', {moment,pathName,uniqueIncomeCategoryArray,data,pathName,thirtyDaysPrior,uniqueExpenseCategoryArray})
  } catch (error) {
    next(error);
  }
})
router.post('/expensecategory/',auth.isUserLogged, async (req,res,next)=> {
  var id = mongoose.Types.ObjectId(req.user.id);
  var pathName = req.path;
  var thirtyDaysPrior = moment().subtract(30, 'days');
  console.log(thirtyDaysPrior,"are BC",pathName);
  try {
    var uniqueExpenseCategoryArray = [];
    var expenseCatArray = await Expense.find({"userId": id, "entryType": "expense"}, "category");
    expenseCatArray.forEach(cat => {
      if(!uniqueExpenseCategoryArray.includes(cat.category)){
        uniqueExpenseCategoryArray.push(cat.category);
      }
    });
    var incomeCatArray = await Income.find({"userId": id, "entryType": "income"}, "source");
    incomeCatArray.forEach(cat => {
      if(!uniqueIncomeCategoryArray.includes(cat.source)){
        uniqueIncomeCategoryArray.push(cat.source);
      }
    });
    var data = await Income.find({"userId": id, "entryType": "income", "category": req.body.category,"date" :{$gte : moment(thirtyDaysPrior).format(), $lte: moment().format()}});
    console.log(uniqueIncomeCategoryArray);
    res.render('userDashboard', {moment,pathName,uniqueExpenseCategoryArray,data,pathName,thirtyDaysPrior,uniqueIncomeCategoryArray})
  } catch (error) {
    next(error);
  }
})


,"date" :{$gte : moment(thirtyDaysPrior).format(), $lte: moment().format()}
