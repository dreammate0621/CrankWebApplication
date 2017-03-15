
using Crankdata.Models;
using CrankService.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CrankService.Controllers
{
    public class StationController : Controller
    {
        CrankdataContext _stationsContext = new CrankdataContext();
        IMongoCollection<Station> _stations = null;
        public StationController()
        {
            _stations = _stationsContext.Stations;
        }


        [HttpGet()]
        [Route("/api/v1/stations")]
        public async Task<IActionResult> Get()
        {
            try
            {
                var cursor = await _stations.FindAsync<Station>(new BsonDocument());
                return Ok(cursor.ToList());
            }
            catch (Exception e)
            {
                Console.WriteLine("{0} Exception caught.", e);
                return NoContent();
            }

        }

        [HttpPost()]
        [Route("/api/v1/stations/search")]
        public async Task<IActionResult> Post([FromBody] StationFilter filter)
        {
            try
            {
                var cursor = await _stations.FindAsync<Station>(filter.ToFilterDefinition());
                return Ok(cursor.ToList());
            }
            catch (Exception e)
            {
                Console.WriteLine("{0} Exception caught.", e);
                return NotFound();
            }
        }

        [HttpGet()]
        [Route("/api/v1/stations/{callcode}")]
        public async Task<IActionResult> Get(string callcode)
        {
            try
            {
                StationFilter filter = new StationFilter();
                filter.Callcode = callcode;

                var cursor = await _stations.FindAsync<Station>(filter.ToFilterDefinition());
                return Ok(cursor.ToList());
            }
            catch (Exception e)
            {
                Console.WriteLine("{0} Exception caught.", e);
                return NotFound();
            }
        }
    }
}
