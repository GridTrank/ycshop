module.exports = {
    tel:(tel)=>{
      var myreg = "^(1)[0-9]{10}$";
        myreg = new RegExp(myreg);
        return myreg.test(tel);

    }
}

