## OVO Next Q1 2025 Workshop API First

TODO
----
- team?
    -> Luke, list
- remove graphql/gravitee
- Slides Story / Example Mapping
- Slides/prints for each service

Numbers:

- 7-9 'Pods'
- 21-27 services

- 3\*21 = 63 engineers
- 3\*27 = 81 engineers

- 38 product people in total (- X for portfolio)

# Pods

- Emergency response
  Police
  Fire
  Ambulance
  Dispatch
- Energy
  Powerplant
  Powernet
  Electricity Meters
- Water
  Water Treatment Plant
  Water Supply pipes
  Water meters
- Traffic
  Traffic cameras
  Traffic lights
  Parking control
- Administration
  Permits
  Passports
  Fines
- Finance
  Budgetting
  ? Auditing
  Reporting
- Parks and recreation
  Park Maintenance
  Festivals and events
- Commerce
  Permits
  Shopping centres
  Facilities (sports, arts)
- Health
  Hospitals
  Pharmacy

# Elements per team / pod

- Info sheet - Resource, fields - Description
  ? - Actors (users)
- Story Map - Features
  - Flow over services in Pod
  - More than one flow across Pods
  - Something pub/sub?

Plus:

- At least one example worked out

# Structure of assignments

Start with short explanation of Story Mapping: - A flow of functionality, achieving a goal - Overview - Slices and planning - API first: - The first slices are _easy_: resource, base (CRUD) actions - Flow for single services is simple, over multiple services is becomes more interesting

In the 'Features' section for each individual service below, the type of assignment is reference between square brackets "[1]". Mostly, there will be overlap and people will naturally go through different elements as they start story mapping and we will guide them through different types of implementations. If that doesn't happen, the specific assignments should trigger it.

## Assignment type 1: Make a map with different situations for direct use of the service

    Learning Goal: Understanding the domain, understanding the split over different services, API first
    Use: make it clear what can be done with the base service in isolation, document functionality and align with engineering
    But: Will not necessarily *drive* implementation, as engineers get that by just implementing base actions on resource
    Merge: Walk through stories with engineering, verify it's implemented as expected

> > Q: Do merge here, or after second level?

## Assignment type 2: When we have a broader goal, actually coming from a user, it gets more intersting. Integration within POD

    Learning Goal: Slices, Iterative delivery, integration
    Use: Actual end-user functionality/goals, finding small slices to plan, drive new implementation

    Merge: talk through slices with engineering, trigger next steps in implementation

[Another explanation: example mapping intro:
- Business rules and 'acceptance criteria'
- Examples
- Formulating examples to Scenarios
- Normally done with the whole team...
]

## Assignment type 3: More complicated functionality where you need to define the logic

    Learning Goal: Example Mapping, Examples/Scenarios, going into detail
    Use: Specify 'complicated' business rules

    Merge: Talk through examples with engineering, trigger tests and implementation

## Assignment type 4: Integrations that can be asynchronous, guaranteed delivery, pub/sub

    Learning Goal: Broadcasting changes in state that are useful to potentially different interested parties
    Use: Use pub/sub to ensure information will be received, but not care about speed or response

    Merge: discuss functionality with engineering, trigger use of pub/sub

## Assignment type 5: Gravitee and the Graph

    Learning Goal: Some functionality is non-functional, technology and architecture are impacted by NFRs
    Use: Limited bandwidth can mean less room for many API calls, implement limited base functionality while allowing deeper functionality when full bandwidth is available

    Merge: discuss non-functional requirement with engineering, trigger use of Gravitee GraphQL facade

## Assignment type 6: Scheduling

    Learning goal: Dealing with recurring jobs and events
    Use: Some things need to be done on a recurring cadence, either from business needs (finance reporting) or functional ones (recurring events), which is triggering specific workflow in a different way

    Merge: discuss recurring triggers with engineering, trigger use of scheduled jobs

# The assignments per service

## Pod: Emergency response

### Police

- Resource: Police patrol
  Fields:
  - Location
  - Id
  - Type
  - Active call
    Description: A police patrol (on foot, bike, car or horse!) can react to different types of calls. ...
    Features:
    - [1] A patrol can be on a call, triggered by:
      self-reported
      dispatch
      another patrol
    - [2] A patrol can request help from ambulance, firefighters, other police patrols
    - [3] A patrol of type X can respond to calls of type Y
      - traffic violation -> car
      - shoplifting -> on foot, bike, car
      - unrest in park -> foot, bike, horse
      - crowd control -> horse, car, ME
    - [4] Patrols need to let Finance Reporting know what calls they respond to
  #  - [5] Patrols need access to the most crucial information even when in an area with low bandwith
    - [6] Patrols can be pre-planned in the case of events (crowd control, support, security)

### Fire

- Resource: Fire truck
  Fields:
  - Id
  - Location
  - Type
  - Active call
  - Water pump capacity
  Description: A fire fighter truck comes with a team of firefighters, sometimes a ladder, the ability to pump water, and sometimes a water reservoir for locations where there's no easy access to a water supply. Fire fighters can respond to calls of different types. Some cars have divers, for when there's an incident in the water.
  Features:
    - [1] A fire truck can be on call, triggered by:
      dispatch
      another fire truck asking for assistance
      a police patrol asking for assistance
    - [2] A fire truck can request help from ambulance and police patrols
    - [3] A fire truck of type X can respond to calls of type Y
      - car in water -> divers
      - fire in zone without available water -> truck with reservoir
      - fire -> any
    - [4] Fire trucks need to let Finance know what calls they respond to
#    - [5] Fire trucks need access to the most crucial information even when in an area with low bandwith
    - [2] Fire trucks need know where water supply pipes are
    - [6] Fire trucks need schedules maintenance and training

### Ambulance

- Resource: Ambulance
  Fields:
  - Id
  - Location
  - Active call
  Description: An ambulance comes with a driver and EMT, and can respond to different types of calls.
  Features:
  - [1] An ambulance can be on call, triggered by:
    dispatch
    another ambulance asking for assistance
    a polict patrol or firetruck asking for assistance
  - [2] An ambulance can request help from police patrols and traffic control
  - [3] An ambulance can respond to calls of type Y
    - accident
    - medical emergency
    - potential for injuries (events, etc)
  - [4] An ambulance needs to let Finance know what calls they respond to
#  - [5] An ambulance need access to the most crucial information even when in an area with low bandwith
  - [2] An ambulance needs know where hospitals are
  - [2] An ambulance needs let a hospital know they are coming with a specific patient
  - [6] An ambulance needs schedules inventory and training events

### Dispatch

- Resource: Dispatch
  Fields:
  - Id
  Description: Dispatch can be called to request an emergency service, such as a police patrol, ambulance of fire truck. Based on the specific needs, dispatch can send one or more of those to a location, either immediate or planned.
  Features:
  - [1] A client can request an emergency service (police, fire, ambulance)
  - [2] A free service (police patrol, ambulance, fire truck) can be sent on a call by dispatch
  - [3] A client can report an emergency by type:
    - burglary
    - assault
    - fire
    - traffic accident
    - car in water
    - ...
  - [2] An emergency service can request additional services with high priority
  - [4] Dispatch needs to let Finance know what calls are received, and what response was sent
#  - [5] Dispatch needs to be able to assign calls to a service even when the recipients are in a low bandwidth area

## Pod: Energy

### Powerplant

- Resource: Powerplant
  Fields:
  - Id
  - Capacity (in units)
  - Cost per unit
  - Location
  - Current delivery
    Description: A powerplant can deliver a certain amount of energy per minute, at a specific cost.
    Features:
  - [1] A powerplant can deliver energy to any meter connected to it through the powernet
  - [3] A powerplant can only deliver energy up to the total capacity, when energy is requested when the capacity is exhausted, it will be denied
  - [4] A powerplant will let finance reporting know how much energy was delivered in a timespan, and at what price
  - [3] A powerplant can have different capacity depending on the time of day
  - [3] A powerplant can have different pricing based on the time of day
  - [3] A powerplant can have different pricing based on capacity available

### Powernet

- Resource: Utility pole
  Fields:
  - Id
  - Capacity (in units)
  - Connected meters
  - Connected Powerplants
  - Location
  Description: A utility pole distributes energy by connecting power plants to energy users (meters)
  Features:
  - [2] A utility pole needs to be connected to a powerplant to be able to deliver energy
  - [2] A utility pole can deliver energy to any number of connected meters
  - [3] A utility pole can only deliver energy if the powerplant has sufficient capacity
  - [3] A utility pole can deliver energy from multiple powerplants
    - And select based on capacity
    - And select based on price
  - [3] A connected meter can deliver power back to the distributor as well, and act as a powerplant
    - Price of meter provided power is alway 80% of the lowest price of any connected powerplant
    - If the total power from meters is above the distributor's capacity, the distributor goes off-line
  - [4 and 6] A utility pole reports the used capacity and number of connected meters every hour to Auditing

### Electricity Meters

- Resource: Electricity meter
  Fields:
  - Id
  - Current use
  - Connected utility poles
  - Current price per unit
  - Capacity
  - Location
  Description: An electricity meter draws power from a utility pole, as requested by its users
  Features:
  - [1] A meter can report current use and connected utility poles, as well as current price
  - [2] A meter can only draw power when connected to a utility poles
  - [3] A meter can only draw as much as its maximum capacity
  - [4 and 6] A meter needs to let Finance know how much power it's consuming per hour from which utility poles and at what price
  - [3] A meter can return power to the utility poles if it is generating more power than it's using (solar panels)

## Pod: Water

### Water Treatment Plant

- Resource: Water Treatment Plant
  Fields:
  - Id
  - Capacity (in units)
  - Cost per unit
  - Location
  - Current delivery
  - Current water pressure
  - Target water pressure
  Description: A water treatment plant can deliver a certain amount of water, at a specific cost.
  Features:
  - [1] A water plant can deliver water to a certain capacity and pressure, and for a price
  - [2] A treatment plant can deliver water to any water outlet (water meter) connected to it through the water supply pipes
  - [3] A water treatment plant can only deliver water up to its total capacity, when water is requested when the capacity is exhausted, water pressure will drop
  - [4 and 6] A treatment plant will let finance know how much water was delivered in a timespan, and at what price

### Water Supply pipes

- Resource: Water Supply pipes
  Fields:
  - Id
  - Capacity (in units)
  - Pressure
  - Allowed pressure
  - Connected outlets
  - Connected treatment plants
  - Location
  Description: A water pipe transports water to users (water meters)
  Features:
  - [1] A pipe has a location and capacity
  - [2] A water pipe needs to be connected to a treatment plant to be able to deliver water
  - [2] A water pipe can deliver water to any number of connected outlets
  - [3] A water pipe can only deliver water if the treatment plant has sufficient capacity and pressure
  - [4 and 6] A pipe reports the used capacity and number of connected meters every hour to Auditing

### Water outlet / meter

- Resource: Water outlet
  Fields:
  - Id
  - Current use
  - Total use
  - Connected pipe
  - Current price per unit
  - Current pressure
  - Location
  Description: An water meter measures how much water is used by a water outlet (home, fire hydrant, ...)
  Features:
  - [1] A meter can return the current use, pressure and pricing for water
  - [2] A meter is always connected to a single pipe
  - [3] A meter can only draw as much as its maximum water pressure capacity
  - [4 and 6] A meter needs to let Finance know how much water it's consuming per hour from which pipe and at what price
  - [5] The closest outlet to a location needs to be available in all circumstances to ensure even low bandwidth environments allow fire trucks to find a water outlet

## Traffic

### Traffic cameras

- Resource: Traffic cameras
  Fields:
  - Id
  - Location
  - Type [speed, light]
  - Traffic observation: 
    - Location 
    - Location type (road, traffic light) 
    - Location state (speed limit, traffic light state) 
    - License plate 
    - Time 
    - Speed
  Description: A traffic camera observes traffic, and when a car drives faster than the allowed speed at a location, or crosses a street while the traffic light is red, it signals the transgression to the appropriate parties (Fines in Administration)
  Featuress:
  - [1] A traffic cam can observice speed and direction of a car, reporting an observed license plate.
  - [2] A traffic camera should be able to find out if traffic lights are red or green at a certain time
  - [2 and 4] A traffic camera can 'watch' traffic go by (Pub/Sub? direct calls also OK), and register its observations
  - [3] A traffic camera can decide an observation is a transgression if:
    - Speed is higher than allowed on a road
    - A car crosses when the light is red
    - Speed is negative (wrong direction)
  - [4] A traffic cam should report every transgression to the Fines service in Administration

### Traffic lights

- Resource: Traffic lights
  Fields:
  - Id
  - Location
    - Road crossed
    - Road
    - Direction
  - Time
  - State
  Description: A traffic light controls traffic at a specific road crossing. It can either allow traffic through (green) or stop it (red).
  Features:
  - [1] A traffic light can be either red or green at any point in time
  - [1] A traffic light can be switched from one state to the other on request
  - [2 and 3] A traffic light on a road crossing should have the inverse state of another traffic light that controls the road crossed
  - [2 and 3] A traffic light on a road crossing should have the same state as another light on the same crossing that is for a different direction
  - [6] A traffic light can be scheduled to switch from state at a regular schedule
  - [4] Any override of the programmed schedule should be reported to Administration Auditing service

### Parking control

- Resource: Parking spot
  Fields:
  - Id
  - Location
    - Road
    - Parking location number
  - Time
  - Rates
  - Current rate
  - State
  - License plate
  Description: A parking spot is a place a car can be parked. The spot can either be occupied or not, and has rates for parking which can vary depending on the day and time.
  Features:
  - [1] A parking spot has rates that can be requested by cars
  - [3] A parking spot can be occupied, or not
  - [3] A parking spot can be paid for, or not
  - [4] If a parking spot is occupied, that information, including the paid amounts, rates and car, should be reported to Finance.

## Administration

### Permits

- Resource: Permits
  Fields:
  - Id
  - Event Type
  - Event date
  - Event location
  - Recipient
  - State
  Description: Permits can be requested for events. They can be approved or denied. Events are for a specific location and date(s).
  Features:
  - [1] A permit can be requested and approved
  - [2] A permit can need additional power or water
  - [3] If a permit requires power or water, a distributor respectively pipe needs to be available at the location and have capacity to spare
  - [4] A permit can have a specific cost, and once paid this should be reported to Finance

### Passports

- Resource: Passport/ID
  Fields:
  - Id
  - Person
  - Location (address of the person)
  - Valid to dates
  Description: Citizens can request a passport. They need this ID to be able to use public services, and identify themselves when they get a fine or are arrested. A passport is valid for 5 years. The passport costs €50,-
  Features:
  - [1] A passport can be created and requested
  - [3] If a passport is no longer valid, it should only return a notification that there is no valid passport
  - [4] A passport costs money, and once paid this should be reported to Finance
  - [6] Every day, any passport that expires should result in any open permits for the person identified by that passport to become invalid

### Fines

- Resource: Fine
  Fields:
  - Id
  - Type
  - Cost
  - Person
  - Date issued
  - Date paid
  Description: People can get fined for different reasons. The fine is always for a specific person, identified by their ID/Passport, and it needs to be paid in time.
  Features:
  - [1] A fine can be issued against a person or a car
  - A fine can be issued by... (auth?)
  - [1] A fine can be paid
  - [3] A fine needs to be paid withing a fixed period after it is issued. This period is different for different types of fines.
  - [4] When a fine is paid, it should be reported to Finance
  - [6] Every day, for any fine that is not paid and has a payment term coming within 7 days should send a message to the person the fine was issued to
  - [2, 3 and 6] If a fine is not paid in time, an extra administrative cost is added per week it is late, and every time the cost increases another notification is sent to the person. When it is a month late, a police patrol is sent to retrieve the money, or break a leg / arrest.

## Finance

### Budgetting

- Resource: Budget entry
  Fields:
  - Id
  - Investment type
  - Investment number
  - Cost
  - Expected value
  - Investment period
  Description: The city council allocates budget for certain things to invest in police patrols, fire trucks, water treatment plants, energy plants, etc. The budget controls how much of these are available to the city. Each investment can have an expected value, in terms of energy sold, water used, fines paid or buildings and people saved.
  Features:
  - [1] A budget entry can be created and changed over time
  - [2] A budget entry should create new instances of the investment type that is being invested in
  - [3] The city council needs to be able to get an overview of the total investments made per category and time period, as well as the expected value delivered
  - [6] If an investment period ends, the item invested in should no longer be available
  - [4] Finance reporting should always be notified of any investments made

### Financial reporting

- Resource: Financial report
  Fields:
  - Id
  - Report type
  - Report amount
  - Investment period
  - Investment type
  - Report date
  Description: Financial reports are for keeping track of both spending and incoming. The financial reports coming in are related to a Budget Entry, and are reported by other resource types, such as a police patrol or energy meter.
  Features:
  - [1] A financial report entry can be created by any other resource
  - [3] A financial report, calculating totals, can be requested for a period and by report types or investment types
  - [4] Financial reports should never be lost (pub-sub)
  - [6] At predefined schedules reports of all spending and income for a given period should be generated.

## Parks and recreation

### Park maintenance

- Resource: Park Maintenance
  Fields:
  - Id
  - Location
  - Activity
  - Date Planned
  - Date Performed
  Description: Park maintenance is there to maintain parks and other public green. They do this by performing various activities, such as mowing the grass, pruning trees, chopping trees, placing benches, cleaning water, etc.
  Features:
  - [1] An action of park maintenance can be created
  - [4] Any action of park maintenance is reported to auditing
  - [6] Park maintenance actions are often scheduled in advance, and be on a repeated schedule
  - [3] Park maintenance action can also be requested by others, based on events (fallen tree, for instance) or simple requests (fear of fallen tree?)

### Festivals and events

- Resource: Events
  Fields:
  - Id
  - Location
  - Event type
  - Date
  - Support needed
  - Permits needed
  Description: Festivals and events can be planned for a location and date. Different types of events can have different needs for support (electricity, water, police, health services, etc.)
  Features:
  - [1] An Event can be planned for a specific date and location
  - [2] The necessary support and permits can be specified for an event, creating requests for other services
  - [3] Specific types of events can only be given permit if specific support and permits are arranged
    - Police and ambulance presence for:
      - concerts
      - political rallies
      - protests
    - Food and health licensing for:
      - street/food markets
      - festivals
    - ...
  - [3] Once all permits and support are specified, the event can be scheduled
  - [4] All events should be reported to auditing and finance
  - [6] After the event, it should be removed

## Commerce

### Permits

- Resource: Commerce Permits
  Fields:
  - Id
  - Commerce type
  - Location
    - Shopping centre
  - State
  - Date
  - Expiration date
  - Cost
  Description: Commerce Permits can be requested for commercial activities, ranging from shops, restaurants, bars, markets, to street performers and car sales lots. They can be approved or denied.
  Features:
  - [1] A commerce permit can be requested and approved
  - [2 and 3] A commerce permit can need additional power or water or other types of (administrative) permits, depending on the commerce type:
    - Petrol station:
      - Fire hazard inspection permit
      - Toxit materials permit
    - Club:
      - additional power meter and own distributor
      - Sound isolation inspection
    - ...
  - [4] A Commerce permit can have a specific cost per time period (tax), and this should be reported to Finance
  - [6] Every month, a report on the amount of running commerce licenses per type, the amount that are issued, and which licenses will expire in the next month.

### Shopping centres

- Resource: Shopping centre
  Fields:
  - Id
  - Location
  - Size (number of shops, restaurants, ...)
  Description: Shopping centres are areas of the city where commercial activities are encouraged. They require a level of investment from the city in terms of energy, traffic, parking and support, so only a limited number can be supported.
  Features:
  - [1] A shopping centre can be created for a location and given a certain size
  - [2] A shopping centre can only support a certain number of commercial activities, measured in the number of commerce permits active for the shopping center
  - [2 and 3] A shopping center has a cost in terms of support and resources, depending on the size
    - 1 police patrols per day per 15 commercial activities
    - 100 units of water per day per 10 commercial activities
    - ...
  - [6] A report on the occupancy of the shopping center is generated every month

### Facilities (sports, arts)

- Resource: Facility
  Fields:
  - Id
  - Location
  - Type (arts, sports, ...)
  - Permits
  - Resources needed
  Description: Facilities are there to support elements of human activity that are not necessarily commercial in nature, such as sports facilities and arts (galleries, museums, theatre, concert halls, ...)
  Features:
  - [1] A facility can be created at a location
  - [1] A facility can be of different types
  - [2 and 3] Different types of facilities need different resources:
    - a football field needs 10 units of water per day
    - a football field needs 150 parking spots
    - a theater needs its own power distributor
    - a museum needs additional police patrols
  - [2 and 3] Different types of facilities need specific permits:
    - a concert hall needs late night noise permits
    - a football field needs food preparation permits for hot dogs
  - [4] Any time a facility is created it should be reported through to the Adminstration Auditing service

## Health

### Hospitals

- Resource: Hospital
  Fields:
  - Id
  - Location
  - Special services
  - Capacity ER
  - Capacity beds
  - Occupied ER
  - Occupied beds
  Description: A hospital is a necessary service in any city. Enough beds for the population of the city are necessary. A hospital has a capacity in terms of the amount of patients it can handle, and separately how many in ER it can support. It should also know how many are currently occupied.
  Features:
  - [1] A hospital can be created with a certain capacity
  - [2 and 3] A hospital should be able to tell an ambulance whether it has open capacity for a patient
    - Needing ER
    - Needing a bed
    - Needing a special service (skin transplant, heart transplant, ...)
  - [4] An hospital needs to let Finance and Auditing know what how many patients it has, and of which type (regular, ER, special)
  - [5] The closest outlet to a location needs to be available in all circumstances to ensure even low bandwidth environments allow fire trucks to find a water outlet

### Pharmacy

- Resource: Pharmacy
  Fields:
  - Id
  - Location
  - Supplies
  Description: A pharmacy has supplies of medicine and other medical supplies, and supplies hospitals and ambulances with those supplies.
  Features:
  - [1] A pharmacy can be created at a specific location
  - [2 and 3] A pharmacy can store supplies, which have a name, unit, price and available supply:
    - paracetamol, pills of 500mg, GBP 1, 5000
    - bandage, 10cmx10m, GBP 5, 200
  - [2 and 3] Supplies can be withdrawn from a Pharmacy (by an ambulance or hospital) and:
    - An ambulance can only receive 5 rolls of bandage per re-supply
    - A hospital can receive maximal 1000 pills of paracetamol per re-supply
    - ...
  - [4] An pharmacy needs to let Finance and Auditing know what both any new supplies, and and supplies done to any hospital or ambulance
  - [6] Every week, a pharmacy needs to provide a full report on the current supplies to ensure there's no irregularities with sensitive drugs
