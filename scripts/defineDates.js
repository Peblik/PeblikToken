module.exports = function(callback) {

    //var dt = new Date();
    const earlyTime = 1524520800;
    //const earlyTime = Math.round((dt.getTime())/1000) + 343800; 
    const startTime = earlyTime + 604800;
    const endTime = startTime + 1209600; // 14 days after start

    console.log("earlyTime: " + earlyTime + " = " + new Date(earlyTime * 1000).toLocaleString());
    console.log("startTime: " + startTime + " = " + new Date(startTime * 1000).toLocaleString());
    console.log("endTime: " + endTime + " = " + new Date(endTime * 1000).toLocaleString());
  
}