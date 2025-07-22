using System.ComponentModel.DataAnnotations;

public class DeactivateUserModel
    {
        [Required]
        public string UserId { get; set; } = string.Empty;
    }