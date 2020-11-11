// solaredge.js V1.0
// Run Script with Scriptable.
// Parameter use by Scriptable
// 10C.Thomas Burchert
// MIT-Lizenz
// Script/Widget nutzt die API von SolarEdge
// Anzeige einer Übersicht der Daten, die auch 
// auf der Webseite angezeigt werden. 
// 
// Parameter:
// 1. Anlagennummer, von der Webseite kopieren
// 2. Key, von der Webseite kopieren
// Bitte beide Parameter in die untere URL eingeben.

const apiUrl = "https://monitoringapi.solaredge.com/site/xxxxxx/overview?api_key=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

let widget = await createWidget()
if (!config.runsInWidget) {
  await widget.presentSmall()
}

Script.setWidget(widget)
Script.complete()

async function createWidget(items) {
  let fm = FileManager.local()
  let dir = fm.documentsDirectory()
  let path = fm.joinPath(dir, "scriptable-solaredge.json")

  const list = new ListWidget()
  list.addSpacer(16)

  try {
    let r = new Request(apiUrl)
    // setting the mobile header
    r.headers = {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1"
    }
    
    let data, fresh = 0
    try {
      // Fetch data from inverter 
      data = await r.loadJSON()
      // Write JSON to iCloud file
      fm.writeString(path, JSON.stringify(data, null, 2))
      fresh = 1
    } catch (err) {
      // Read data from iCloud file
      data = JSON.parse(fm.readString(path), null)
      if (!data || !data.overview.list.lastUpdateTime) {
        const errorList = new ListWidget()
        errorList.addText("Check connection, normally the inverter is just reachable in your internet account")
        return errorList
      }
    }
    
    const line1 = list.addText("SolarEdge Data")
    line1.font = Font.boldSystemFont(14)
    
    const line2 = list.addText("Aktuell: " + Math.round(data.overview.currentPower.power/10)/100 + " kW")
    line2.font = Font.mediumSystemFont(12)
    line2.textColor = Color.red()
    
    const line3 = list.addText("Heute: " + Math.round(data.overview.lastDayData.energy/10)/100 + " kWh")
    
    line3.font = Font.mediumSystemFont(12)
    
     const line4= list.addText("Monat: " + Math.round(data.overview.lastMonthData.energy/10)/100 + " kWh")
    line4.font = Font.mediumSystemFont(12)
    
     const line5= list.addText("Jahr: " + Math.round(data.overview.lastYearData.energy/10000)/100 + " MWh")
    line5.font = Font.mediumSystemFont(12)
    
    const line6= list.addText("Life: " + Math.round(data.overview.lifeTimeData.energy/10000)/100 + " MWh")
    line6.font = Font.mediumSystemFont(12)
    line6.textColor = Color.red()
    
   // list.addSpacer(16)
        
    if (fresh == 0) {
      line1.textColor = Color.darkGray()
      line2.textColor = Color.darkGray()
      line3.textColor = Color.darkGray()
      if (data.remainingTimeStr) {
        line4.textColor = Color.darkGray()
        line5.textColor = Color.darkGray()
      }
    }
    
  } catch(err) {
    list.addText("Error fetching JSON from your inverter!!!")
  }

  // Add time of last widget refresh:
  list.addSpacer(4)
  const now = new Date();
  const timeLabel = list.addDate(now)
  timeLabel.font = Font.mediumSystemFont(10)
  timeLabel.centerAlignText()
  timeLabel.applyTimeStyle()
  timeLabel.textColor = Color.darkGray()
  
  return list
}
