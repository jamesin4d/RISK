var itv = 0;
var ill = false; 
var cov = false;
app.LoadPlugin( "BluetoothLE" );

//alright so we want the app to run in the background 
//searching for BTLE signals within range that are tagged "sick"
//broadcast our own signal tag
//update notifications accordingly




//Called when application is started.
function OnStart()
{
	//Create a layout with objects vertically centered.
	lay = app.CreateLayout( "linear", "VCenter,FillXY" );	
    //TODO create settings for this
    app.SetAutoBoot(true)
    
	//Create a text label and add it to layout.
	txt = app.CreateText( "RISK prototype" );
	txt.SetTextSize( 32 );
	lay.AddChild( txt );
	//bluetooth states 
	var status = app.IsBluetoothEnabled()
    var state = app.IsBluetoothOn();
    //display this for me
    app.ShowPopup(
        "Bluetooth is " +
        (status ? "enabled" : "disabled") +
        (status == state ? " and " : " but ") +
        (state ? "on" : "off")
    );
	//bluetooth enable and disable buttons
	btnSave = app.CreateButton( "Enable", 0.5, 0.1 );
    btnSave.SetOnTouch( btn_OnTouch );
    lay.AddChild( btnSave );
    //disabled
    btnLoad = app.CreateButton( "Disable", 0.5, 0.1 );
    btnLoad.SetOnTouch( btn_OnTouch );
    lay.AddChild( btnLoad );
	// check boxz
	sickCh = app.CreateCheckBox("I feel sick...");
	sickCh.SetOnTouch(sick_OnTouch);
	lay.AddChild(sickCh);
	posCh = app.CreateCheckBox("I AM sick...");
	posCh.SetOnTouch(pos_OnTouch);
	lay.AddChild(posCh);
	
	//scan results log
	txt = app.CreateText( "", 0.8, 0.6, "Log" );
    lay.AddChild( txt );
    //scan for BTLE devices 
    btn = app.CreateToggle( "Scan", 0.4, 0.1 );
    btn.SetOnTouch( btn_OnTouch );
    lay.AddChild( btn );

    app.AddLayout( lay );

    ble = app.CreateBluetoothLE();
    ble.SetOnDevice( OnDevice );
	
	//notify
    notify = app.CreateNotification();
    notify.SetMessage("Ticker","RISK","someone near you is sick");
    notify.Notify("testID");
    //setTimeout(cancel,5000);
	//Add layout to app.	
	app.AddLayout( lay );
}

function cancel()
{
    notify.Cancel("testID");
    app.ShowPopup("Notification cancelled");
}

function sick_OnTouch(isChecked)
{
    app.ShowPopup("sick" + isChecked, "Short");
}
function pos_OnTouch(isChecked)
{
    app.ShowPopup("positive" + isChecked, "Short");
}
function btn_OnTouch()
{
    if( itv ) return;
    var op = this.GetText();

    if( op == "Enable" )
    {
        app.ShowProgress( "Enabling Bluetooth" );

        if( !app.IsBluetoothEnabled() )
            app.SetBluetoothEnabled( true );

        itv = setInterval( CheckBtOn, 200 );
    } else {
        app.ShowProgress( "Disabling Bluetooth" );

        if( app.IsBluetoothEnabled() )
            app.SetBluetoothEnabled( false );

        itv = setInterval( CheckBtOff, 200 );
    }
}

function btn_OnTouch( isChecked )
{
  if( isChecked ) ble.StartScan();
  else ble.StopScan();
}

function OnDevice( name, address, bonded, rssi, data )
{
  txt.Log( (name?name:data.type) + ": " + address + " -> " + rssi +" dBm" );
}

//i should change this to a single ToggleBt() function later
function CheckBtOn() {
    if( app.IsBluetoothOn() ) {
        app.HideProgress();
        app.ShowPopup( "Bluetooth is on" );
        clearInterval( itv );
        itv = 0;
    }
}

function CheckBtOff() {
    if( !app.IsBluetoothOn() ) {
        app.HideProgress();
        app.ShowPopup( "Bluetooth is off" );
        clearInterval( itv );
        itv = 0;
    }
}
