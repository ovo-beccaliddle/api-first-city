"Central Hall" Dashboard

A web-based visualization showing the city map with different districts representing services
Initially, most of the city is "dark" or grayed out
As services come online, their respective areas light up with activity

"Service Auto-Discovery"

Each service would register itself with the service registry upon startup
The registry would broadcast updates using WebSockets to the dashboard
Services could report their health, API documentation URL, and basic metrics

"Interactive Elements"

Clicking on a "lit" district could show:

Live API documentation (Swagger/OpenAPI UI)
Current status and health
Active connections to other services (showing the interdependencies)

Real-time traffic visualization between services when API calls are made

"Implementation Approach"

Use a simple WebSocket server in the service registry
Create a React-based dashboard that subscribes to service events
Add a small reporting module to each service template that participants implement

"Dramatic Reveal"

Start with the dashboard on the main screen
Have teams start their services one by one
Watch as each district of the city progressively lights up
Demonstrate a cross-service scenario that shows activity flowing across the city

--

# API First Workshop: City Dashboard Implementation

## Overview

The City Dashboard represents the culminating experience of the API First workshop. This central visualization demonstrates how individual services collectively form a functioning city ecosystem, providing a powerful metaphor for API-first development in organizations. As participants complete their service implementations, the dashboard automatically discovers these services and "lights up" different areas of the city, creating a compelling visual finale without requiring any manual configuration from participants.

## Purpose and Educational Value

The City Dashboard serves multiple educational purposes within the workshop:

1. It provides immediate visual feedback when services are correctly implemented
2. It demonstrates the power of service discovery and API-first integration
3. It reinforces the concept that well-designed APIs should "just work" together
4. It creates a memorable finale that reinforces the workshop's key messages
5. It helps participants visualize how their individual contributions form part of a larger system

## User Experience

From the participant perspective, the experience unfolds as follows:

1. Throughout the workshop, participants build and implement their assigned city service APIs
2. When they complete their implementation and run their service, they don't need to perform any additional steps for integration
3. Within seconds, their service appears on the central dashboard, lighting up their section of the city
4. As more teams complete their services, more of the city illuminates
5. The final state shows a fully functioning city with visualized connections between services
6. Participants can click on any service to view its API documentation, current status, and connections to other services

This "magical" experience reinforces the value of standardized API contracts and automated discovery.

## Technical Architecture

### Dashboard Components

The City Dashboard consists of several key technical components:

1. **Frontend Visualization**

   - Interactive city map showing all possible services
   - Real-time status indicators for each service
   - Visualization of cross-service interactions
   - Connection details and metrics
   - Embedded API documentation (Swagger/OpenAPI UI)

2. **Service Registry Backend**

   - Service discovery mechanism
   - Health check and status monitoring
   - API gateway integration
   - WebSocket server for real-time updates
   - API for submitting service information

3. **Client-Side Libraries**
   - Service registration module
   - Health reporting agent
   - Event dispatcher for service interactions

### Network Infrastructure

For the seamless auto-discovery to function, the workshop requires a dedicated network environment with the following specifications:

1. **Dedicated WiFi Network**

   - SSID: "CityAPI-Workshop" with simple password access
   - Isolated network segment (192.168.100.0/24) with DHCP enabled
   - Local DNS server configured to resolve `.city.local` domain
   - Multicast DNS (mDNS) traffic allowed with no client isolation
   - Static IP (192.168.100.3) for the central dashboard server

2. **Zero-Configuration Discovery**

   - mDNS (Bonjour/Avahi) for service advertisement
   - Automatic registration when services start
   - Dashboard polls for service health
   - WebSocket connections for live updates

3. **DNS Configuration**
   - Dashboard accessible at `city-hall.city.local`
   - Services register as `[service-name].service.city.local`
   - Wildcard resolution for dynamic service hosts

## Implementation Details

### City Visualization

The dashboard represents the city as an interactive map with different zones for each service type:

1. **Emergency Services Zone** (Police, Fire, Ambulance)

   - Red-themed district with emergency service buildings
   - Flashing animations for active incidents
   - Dispatch visualization

2. **Utilities Zone** (Water, Electric, Waste)

   - Infrastructure-themed area with utility buildings
   - Flow animations showing resource movement
   - Usage metrics and outage indicators

3. **Transportation Zone** (Traffic, Public Transit)

   - Road networks and transit hubs
   - Moving animations for vehicles
   - Traffic conditions visualization

4. **Citizen Services Zone** (Requests, Permits)
   - City hall and government buildings
   - Citizen avatar animations
   - Service request visualization

### State Visualization

The dashboard uses visual cues to represent service states:

1. **Unimplemented Services**: Grayed out, dark buildings
2. **Running Services**: Illuminated buildings with active animations
3. **Healthy Connections**: Bright pathways between services
4. **API Calls**: Animated data packets moving between services
5. **Errors/Issues**: Warning indicators and error messages

### Technical Implementation

The dashboard is implemented using:

1. **Frontend Stack**

   - React for UI components
   - D3.js for data visualization
   - WebSockets for real-time updates
   - HTML5 Canvas for animations

2. **Backend Services**

   - Node.js server for service registry
   - WebSocket server for push notifications
   - Express.js for REST API endpoints
   - In-memory database for service state

3. **Client Integration**
   - Service registration module included in starter templates
   - Automatic mDNS advertisement
   - Event hooks for cross-service communication

## Service Registration Flow

The automatic service discovery follows this sequence:

1. **Service Startup**

   - Service starts on participant's laptop
   - Service registers itself via mDNS with type `_cityapi._tcp.local`
   - mDNS advertisement includes service type, name, and port

2. **Dashboard Discovery**

   - Dashboard listens for mDNS advertisements
   - New services are detected automatically
   - Dashboard connects to the service's health check endpoint
   - Service metadata is retrieved including OpenAPI documentation URL

3. **Visual Integration**

   - Dashboard maps the service to its city location
   - Area is "illuminated" with appropriate animations
   - Service information is added to the registry
   - Potential connections to other services are established

4. **Ongoing Monitoring**
   - Periodic health checks maintain status
   - Traffic between services is visualized when it occurs
   - Status changes trigger visual updates

## Setup and Deployment

### Dashboard Deployment

To deploy the City Dashboard:

1. Set up the central server at the static IP (192.168.100.3)
2. Deploy the dashboard application
3. Configure the service registry
4. Test with sample services prior to workshop

### Participant Connection

Participants simply:

1. Connect to the "CityAPI-Workshop" WiFi network
2. Use the provided service template which includes registration code
3. Implement their assigned service
4. Run the service locally - no additional configuration needed
5. View the dashboard at `city-hall.city.local` to see their service appear

### Contingency Plans

In case of network issues:

1. Backup router with identical configuration
2. Manual service registration option
3. Local-only mode with simulated services

## Workshop Integration

### Introduction Phase

During the workshop introduction:

1. Demonstrate the empty city dashboard
2. Show a pre-configured service being added
3. Explain how services will automatically appear
4. Set the goal of fully illuminating the city

### Practise Skills Phase

During implementation:

1. Keep dashboard visible on a central screen
2. Celebrate as teams get their services running
3. Use the visual feedback to encourage progress
4. Highlight interesting service interactions

### Final Reveal

At the workshop conclusion:

1. Showcase the fully illuminated city
2. Demonstrate a complex cross-service scenario
3. Show the complete API ecosystem in action
4. Capture a "city screenshot" as a workshop memento

## Summary

The City Dashboard creates a powerful, tangible metaphor for API-first development by visually demonstrating how individual services combine to create a functioning ecosystem. By leveraging a dedicated network environment with zero-configuration service discovery, participants experience the magic of seeing their work automatically integrate into the larger system without additional effort - exactly what well-designed APIs should enable.

This visual finale reinforces the workshop's core message: When APIs are designed first with clear contracts and standards, integration becomes seamless and the resulting system is greater than the sum of its parts.
