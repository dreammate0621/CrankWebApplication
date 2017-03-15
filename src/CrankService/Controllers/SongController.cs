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
    public class SongController: Controller
    {
        CrankdataContext _songsContext = new CrankdataContext();
        IMongoCollection<Song> _songs = null;
        public SongController()
        {
            _songs = _songsContext.Songs;
        }


        [HttpGet()]
        [Route("/api/v1/songs")]
        public async Task<IActionResult> Get()
        {
            try
            {
                var cursor = await _songs.FindAsync<Song>(new BsonDocument());
                return Ok(cursor.ToList());
            }
            catch (Exception e)
            {
                Console.WriteLine("{0} Exception caught.", e);
                return NoContent();
            }

        }

        [HttpPost()]
        [Route("/api/v1/songs/search")]
        public async Task<IActionResult> Post([FromBody] SongFilter filter)
        {
            try
            {
                var cursor = await _songs.FindAsync<Song>(filter.ToFilterDefinition());
                return Ok(cursor.ToList());
            }
            catch (Exception e)
            {
                Console.WriteLine("{0} Exception caught.", e);
                return NotFound();
            }
        }

        [HttpGet()]
        [Route("/api/v1/songs/{song_id}")]
        public async Task<IActionResult> Get(string artist)
        {
            try
            {
                SongFilter filter = new SongFilter();
                filter.Artist = artist;

                var cursor = await _songs.FindAsync<Song>(filter.ToFilterDefinition());
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
