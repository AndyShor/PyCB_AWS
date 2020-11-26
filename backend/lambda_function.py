"""
this script makes a simple lambda function API endpoint for PyCB

"""
import json
import numpy as np
from scipy.integrate import odeint  # import odeint to integrate system of ODE
import csd


def lambda_handler(event, context):
    specie = event["queryStringParameters"]['element']  # get ion specie name
    energy = event["queryStringParameters"]['energy']  # get electron beam energy
    density = event["queryStringParameters"]['density']  # get electron current density
    min_log_time = int(event["queryStringParameters"]['minlogtime'])  # get lower end of log evolution time interval
    max_log_time = int(event["queryStringParameters"]['maxlogtime'])  # get upper end of log evolution time interval
    vac_pressure = float(event["queryStringParameters"]['rest_gas_pressure'])  # get vacuum pressure
    ionization_potential = float(event["queryStringParameters"]['rest_gas_ip'])  # get rest gas ionization potential
    injection_index = int(event["queryStringParameters"]['injection'])  # define charge state at injection
    element = csd.get_element_data(specie)  # get element object by specie name
    ch_states = np.linspace(0, len(element), len(element) + 1)  # define charge states
    ion_temperature = 300  # set ion temperature in eV
    # calculate reaction rates
    rates = csd.get_reaction_rates(elem=element, j_e=float(density), e_e=float(energy), t_ion=ion_temperature,
                                   p_vac=vac_pressure, ip=ionization_potential,
                                   ch_states=ch_states)
    initial_csd = np.zeros(len(ch_states))  # create initial charge state distribution
    initial_csd[injection_index] = 1  # create initial condition

    time = np.logspace(min_log_time, max_log_time, num=1000)  # generate  log linear time range
    solution = odeint(csd.csd_evolution, initial_csd, time, args=rates)  # integrate ODE

    # create a list with time points, number of states and status code
    responce_dict = {"labels": time.tolist(), 'number_of_ch_states': solution.shape[1], 'statusCode': 200}
    # populate responce dictioary with data for each charge state
    for i in range(solution.shape[1]):
        responce_dict[str(i) + '+'] = solution[:, i].tolist()

    # return responce with the data in stringified json body
    return {"statusCode": 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            "body": json.dumps(responce_dict)}
