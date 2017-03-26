/* File: fluids.js
 * Sets up the simulation and starts running it.
 */

/* Global constants: */
N_DIMS = 2;

X_DIM = 0;
Y_DIM = 1;
Z_DIM = 2;

G_FORCE = -9.8;


// Global variables:
var ui;

/* When document is loaded, initialze the simulation.
 */
function startFluid {
    ui = new UI("fluids_canvas");
    resetSim();
}

/* Adds a gravitational current to the simulation. Calling this
 * repeatedly will just keep adding it over and over.
 */
function addGravityToSim() {
    // note: pass in negative because y-axis is inverted
    sim.addGravity(-G_FORCE);
}

/* Resets and restarts the simulation. */
function resetSim() {
    sim = new Simulator(ui);
}

/* Resets all simulation parameter fields in the GUI to default. */
function resetGUIParams() {
    ui.defaults();
    ui.setUI();
}

/* When the GUI is changed, update simulation parameters. */
function setParamsFromUI() {
    ui.readUI();
}
