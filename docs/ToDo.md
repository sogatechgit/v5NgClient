- (done) Fix nested stack error in custom date filter
- (done) Fix whereClause expression generator 
- (done) Fix filtering for grid management's top grid
- (in progress) Work on Data Grid B multi-row selection
- (in progress) Fix datagrid b button disable states based on record availability ...

- Fix details refresh (empty) when no data found in main grid
- Fix data grid calculated field definition
- Fix risk matrix filtering
- Fix incorrect date value when posting data
- Activate field mapping/nickname
- Fix stray current record pointer when multiple modules are loaded
- Work on frameset management (i.e. panel resizing, pinning, collapse/expand)
- linked record type POST action (Manage action)
- union linked record type data extraction
- calculated field processing from gridConfig entry

Enhancements:
- Linked list management:
	1. On activate, if bottom list (ie. template grid record count is 0), just reload top grid instead of
	   loading both grids
	2. Save column filter parameters  
	   
	3. Mandatory field setup and validation
	4. Field type data validation
	5. Frameset management
	6. Binary File upload through Web REST API
	7. Invoke requery to automatically sync grid and details...
	8. Datagrid column resizing feature...
	9. Improve anomaly risk ranking datagrid rendering by optimizing value and color lookup routines.
	   
TimeLogs:
=================================
2020/02/01 -
	1. (6) Review and enhance client-side calculated field handling
	2. (2) Column resize by dragging enable even when on table details...
---------------------------------
2020/01/29 -
	1. Worked on datagrid draggable column resizing
2020/01/28 -
	1. Worked on datagrid draggable column resizing
	2. MPTL Devcon username correction
2020/01/27 -
	1. Fix date field error in posting (i.e. saved data is one day earlier than what is submitted from the client app,FIXED: auto date conversion replaced with custom date/time to string conversion c:10am)
	2. Worked on datagrid draggable column resizing
2020/01/26 -
	1. Fix filtering issue on toggle type field
	2. Implement Fieldname Alias when specifying request parameter filter
	3. Fix date field error in posting (i.e. saved data is one day earlier than what is submitted from the client appp
	4. Development management
	
2020/01/25 -
	1. Fix calculated column display
	2. Moved Toggle type field setup in table config file
	4. PIMO Telecon with Grace and Abijay
	
2020/01/22 -
	1. Check design data kp based data
	2. Change input component disable assignment from element attribute to reactive form control property (stability issue)
	- User settings management
		- saving column filters
	3. Reactivate sort settings in column filtering

2020/01/21 -
	1. REST API DataView handle
	2. Assess PIMO requirement
	3. Fixed datagrid loading feedback when inserted in details section (double progress prompting)
	4. Fixed stray current and selected record pointer when multiple modules are loaded
	5. REST API Config parameters isolation
	6. user-specific Debugging messaging routine
	
2020/01/20 -
	1. Check Chemdb V2Core Integration
	2. V2 deployment to test site
	3. Link Management Refresh routines
	4. REST API Link Table with classification handler
	5. V2Core Link Table w/ class Grid controller
	
2020/01/19 -
	1. Link Management control development APPLY ACTION
	2. V2Core Multi-select feature
	3. V2Core Filtering by selection
	
2020/01/18 -	

	1. Link Management control development APPLY ACTION
	
2020/01/15 - 2020/01/13
	1. Link Management control development SELECTION ROUTINE
	
2020/01/12 -
	1. fixed 'stack overflow' error when applying complex custom column filtering
	2. fixed add/edit popup window size configuration
	3. created ToolbarButtonComponent to replace embedded native html elements for reusability
	4. fixed min-max grid column width assignment issues
2020/01/11 -
	1. anomalies action items sub-module
	2. fixed issue data requery on module sublist
	3. worked on linked tables (related anomalies, attachments, failure threats)
2020/01/08 -
	1. Revamp implementation of main moudules tab control for stability
	2. anomalies action items sub-module
2020/01/07 -
	2. moved anomalies module to v2 core engine
2020/01/06 -
	1. Worked on module recordtyype filtering and selection on add
	2. Fixed column filter expression builder issues on production build
2020/01/05 -
	1. Worked on details subtable configuration
2020/01/04 -
	1. Fixed tree recoloring on add, edit and delete
	2. CheckExtra method
	
	....
	- Fixed module tab control issue
	