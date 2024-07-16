import { useEffect } from 'react';
// import { useNavigate } from 'react-router';
import api from '../api/axios';


/**
 * OauthCallback Component
 * Handles the OAuth callback authentication process.
 */
const Infographics = () => {

  useEffect(() => {
    
    /**
     * Authenticate the user via OAuth.
     * Sends the query string to the backend for authentication.
     */
    const generateInfographics = async () => {
      try {
        const sparql_query = `SELECT ?state ?capitalLabel ?population ?year
                   WHERE {
                        ?state wdt:P31 wd:Q485258;       
                          wdt:P17 wd:Q155;         
                          wdt:P36 ?capital.       
                        ?capital p:P1082 ?statement. 
                        ?statement ps:P1082 ?population;
                          pq:P585 ?year_aux. 
                        BIND(YEAR(?year_aux) AS ?year)
 
                        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
                        }
                        ORDER BY ?capitalLabel ?year`;

        const response = await api.post('/query', { sparql_string: sparql_query });
        console.log(response.data);
      
      } catch (err) {
        console.log("Error occured while " + err);
      }
    };
    generateInfographics();
  }, []);

  return (
    <>
      <h4> Sending SPARQL Query..... </h4>
      <h4> Receiving Data..... </h4>
    </>
  );
};

export default Infographics;
