# AngularWCM
WCM App for submitting forms -- and a dashboard -- using AngularJS

Angular WCM App Documentation
=============================================
I.	Components
A.	Reporting
B.	Open Issues (Safety)
C.	Forms
II.	Add-ons
A.	Open Issues Alert
B.	Email Script
 
Components
=================
REPORTING<br>
The reporting app is generally navigated to from the WCM dashboard. Within each sub-dashboard (pillar) there is a reporting link, which opens reporting for that pillar. Under the ‘Create Dashboard’ header, the user can select a query, the display type for the data, and other formatting options. They may then add the chart.
Once all of the charts they need are added, they may enter a name under ‘Edit Layout’ and press save to save the layout for future use. There is also a dropdown to open and update previous layouts.
The main controls have accurate descriptions of their use when they are hovered over.
The back-end of this app relies on a dashboard JavaScript file which supplies the layout saving and multiple chart managing capabilities. The charts themselves are supplied by Google Visualization and the conversion of the data to Google Visualization data is done in the chart.js file.
In the charting page itself, the queries are selected as the values of various option elements. These values correspond to named queries in the queries json file. Queries are executed using named connections which are available under the connections json file.

OPEN ISSUES (SAFETY)<br>
The open issues safety app displays all open issues for safety. This is any record from any of the safety forms that was not marked as ‘satisfactory’ and has not yet been closed.
Issues can be filtered by selecting values form the drop-downs and pressing ‘apply’. The values for these filters are rendered using the forms app through a dummy table.
The app allows printing of the data, and exporting to csv.
Each issue can be clicked on to expand the issue details.
To close an issue, press the checkbox and enter an action taken in the prompt.

FORMS<br>
The forms are controlled by a generic back-end class called Form. Form is composed of a collection of Table objects. Table is in turn composed of a collection of Record objects. Record is composed of a collection of Field objects.
Most of the operations that occur are done through the Field class or the Form class. The Record class does have the important job of creating an SQL query to be executed for the Fields that it contains.
Submission of the form is done by the Form class. Updating of dependent fields is done through the Field class. All queries are routed through a Query PHP script. This script takes a named or full SQL query with json parameters and executes it, returning the result as json.

**Special considerations**
On some of the audits, different values are displayed for different locations when selected. This is implemented in an embedded script. This script contains an array containing the data for which lines should be shown based on location. This array is looped through and outputs an array which contains true values for the indices of the lines that should be shown. 
Default values are specified for many forms. The format of these values is such:<br>
*{
TableName:
 	{
 		RecordNumber: {
			FieldName: value,
 			…
 		},
 	…
 	}
}*
Another consideration are the default Record counts which can be passed to the Form initialization function. Default Record counts are used when a form uses some sort of repetitive information, and you want to separate that into another table and normalize it.<br>
Once the table is separated from the parent table, you can specify the number of time you want the repetitive information to appear using a default Record count.
The initialization function looks like this:
initialize(FormName, ConnectionName, [Table1, Table2, …], {Tablex: recordCount}, {Defaults…});
It is found in the body tag of every form.

**SQL**
Much of the important parts of the application are written in SQL. The backend contains many views and stored procedures which are used throughout the application. Careful examination of the scripts will show which queries are in use. For queries used in the dashboard reporting app, look up the name of the query found in the option element, it will have a matching query in the queries json file.
Also, form layouts and dependent fields are decided via foreign key and primary key relations. The primary key for the main table is always the form that opens the table when it is changed.
A foreign key to a table that is included in the form will cause one tables value to update from the other. I.e. a foreign key in table2.field to table1.field will update table2.field with table1.field’s value.
A foreign key to a table that is not included in the form will cause the field to be shown as a dropdown, and it will fetch it values and text from the table which it points to. For this to work, it is required that the table pointed to by the foreign key has a primary key, and has exactly one field which is not a foreign key (this will be the text field).
A string of foreign key relationships will create a series of dependent fields.

**Sketches**
Sketches are implemented using a canvas and drawing lines on that canvas (as fast as the PC can render them). It essentially finds the relative position of the mouse in the canvas, and draws from the previous position to the current position each time the position changes. The sketch is saved each time the user exits the sketch area with the mouse. The sketch is saved as a base64 string.

**Image Upload**
The image upload actually takes and image and saves it as a base64 URI. Therefore, image uploads must refer to a varchar(max) field.

**Finally**
The rest of the forms code is in the implementation and has to be read and used to be understood. There is simply too much to go through to type it all out here.

Add-ons
====================
OPEN ISSUES ALERT<br>
This script sends an email for every open issue specified in a view in the WCM database. It sends each email to specific supervisors depending on the location of the email. The correlation between these two is in the Supervisor table.

EMAIL SCRIPT<br>
This script is executed every five minutes on the server to send any emails in the Emails table. Forms are pushed to the Emails table on successful submission or update. Like the above script, it sends emails to different supervisors depending on the location of the form.
This script is currently executed with my permissions, which is a bit of an issue because it stops working when my password changes.
